import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMicoSmmOrderStatus } from "@/lib/providers/micosmm";
import { getMkapiOrderStatus } from "@/lib/providers/mkapi";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session expired." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
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
        service: {
          select: {
            providerName: true,
          },
        },
        quantity: true,
        charge: true,
        status: true,
      },
      take: 50,
    });

    let updated = 0;
    let refunded = 0;
    let failed = 0;

    for (const order of orders) {
      if (!order.providerId) continue;

      try {
        const provider =
          order.service.providerName === "MKAPI"
            ? await getMkapiOrderStatus(order.providerId)
            : await getMicoSmmOrderStatus(order.providerId);

        const status = provider.status.toUpperCase();

        let newStatus:
          | "PENDING"
          | "PROCESSING"
          | "COMPLETED"
          | "PARTIAL"
          | "CANCELLED"
          | "REFUNDED" = "PROCESSING";

        if (status === "COMPLETED") {
          newStatus = "COMPLETED";
        } else if (status === "PARTIAL") {
          newStatus = "PARTIAL";
        } else if (
          status === "CANCELLED" ||
          status === "CANCELED"
        ) {
          newStatus = "CANCELLED";
        } else if (status === "PENDING") {
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
                ? order.charge
                    .mul(remains)
                    .div(order.quantity)
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
                  remains: provider.remains,
                  startCount: provider.startCount,
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
            startCount: provider.startCount,
            remains: provider.remains,
          },
        });

        updated++;
      } catch (error) {
        failed++;

        console.error(
          `Failed to sync order #${order.id}:`,
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
    console.error("Order sync error:", error);

    return NextResponse.json(
      { error: "Unable to sync orders." },
      { status: 500 }
    );
  }
}

