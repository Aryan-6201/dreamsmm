import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMicoSmmOrderStatus } from "@/lib/providers/micosmm";
import { getMkapiOrderStatus } from "@/lib/providers/mkapi";
import { getSmmGenOrderStatus } from "@/lib/providers/smmgen";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
        providerId: {
          not: null,
        },
        status: {
          in: ["PENDING", "PROCESSING", "PARTIAL"],
        },
      },
      select: {
        id: true,
        userId: true,
        providerId: true,
        status: true,
        quantity: true,
        charge: true,
        service: {
          select: {
            providerName: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
      take: 20,
    });

    let updated = 0;
    let refunded = 0;
    let failed = 0;

    for (const order of orders) {
      if (!order.providerId) continue;

      try {
        const providerName = order.service.providerName?.toUpperCase() || "";

        const provider =
          providerName === "MKAPI"
            ? await getMkapiOrderStatus(order.providerId)
            : providerName.startsWith("SMMGEN")
              ? await getSmmGenOrderStatus(order.providerId)
              : await getMicoSmmOrderStatus(order.providerId);

        const providerStatus = String(provider.status || "").toUpperCase();
        console.log(`ORDER SYNC #${order.id}: provider=${order.service.providerName}, providerId=${order.providerId}, status=${providerStatus}, remains=${provider.remains}, startCount=${provider.startCount}`);

        let newStatus:
          | "PENDING"
          | "PROCESSING"
          | "COMPLETED"
          | "PARTIAL"
          | "CANCELLED"
          | "REFUNDED" = "PROCESSING";

        if (providerStatus === "COMPLETED") {
          newStatus = "COMPLETED";
        } else if (providerStatus === "PARTIAL") {
          newStatus = "PARTIAL";
        } else if (
          providerStatus === "CANCELLED" ||
          providerStatus === "CANCELED"
        ) {
          newStatus = "CANCELLED";
        } else if (providerStatus === "PENDING") {
          newStatus = "PENDING";
        }

        const shouldRefund =
          order.status !== "PARTIAL" &&
          order.status !== "CANCELLED" &&
          (newStatus === "CANCELLED" || newStatus === "PARTIAL");

        if (shouldRefund) {
          let refundAmount = order.charge;

          if (newStatus === "PARTIAL") {
            const remains = Math.max(
              0,
              Math.min(provider.remains ?? 0, order.quantity)
            );

            refundAmount =
              order.quantity > 0
                ? order.charge.mul(remains).div(order.quantity)
                : order.charge;
          }

          if (refundAmount.gt(0)) {
            await prisma.$transaction(async (tx) => {
              await tx.user.update({
                where: {
                  id: order.userId,
                },
                data: {
                  balance: {
                    increment: refundAmount,
                  },
                  totalSpent: {
                    decrement: refundAmount,
                  },
                },
              });

              await tx.transaction.create({
                data: {
                  userId: order.userId,
                  type: "REFUND",
                  amount: refundAmount,
                  note:
                    newStatus === "PARTIAL"
                      ? `Partial refund for order #${order.id}`
                      : `Full refund for cancelled order #${order.id}`,
                },
              });

              await tx.order.update({
                where: {
                  id: order.id,
                },
                data: {
                  status: "REFUNDED",
                  remains: provider.remains ?? null,
                  startCount: provider.startCount ?? null,
                },
              });
            });

            refunded++;
            updated++;
            continue;
          }
        }

        await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: newStatus,
            startCount: provider.startCount ?? null,
            remains: provider.remains ?? null,
          },
        });

        updated++;
      } catch (error) {
        failed++;

        console.error(
          `Failed to sync user order #${order.id}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      checked: orders.length,
      updated,
      refunded,
      failed,
    });
  } catch (error) {
    console.error("User order sync error:", error);

    return NextResponse.json(
      { error: "Unable to sync orders." },
      { status: 500 }
    );
  }
}