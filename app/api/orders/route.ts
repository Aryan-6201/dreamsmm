import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMicoSmmOrderStatus } from "@/lib/providers/micosmm";

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
      where: {
        id: session.userId,
      },
      select: {
        role: true,
      },
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
        charge: true,
      },
      take: 50,
    });

    let updated = 0;
    let failed = 0;
    let refunded = 0;

    for (const order of orders) {
      if (!order.providerId) {
        continue;
      }

      try {
        const provider = await getMicoSmmOrderStatus(
          order.providerId
        );

        const status = provider.status.toUpperCase();

        let newStatus:
          | "PENDING"
          | "PROCESSING"
          | "COMPLETED"
          | "PARTIAL"
          | "CANCELLED" = "PROCESSING";

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

        if (newStatus === "CANCELLED") {
          /*
           * Cancellation + refund happen in ONE transaction.
           *
           * updateMany is intentional:
           * only an order that is still active can enter this block.
           * This prevents a second sync from refunding the same order again.
           */
          const refundResult = await prisma.$transaction(
            async (tx) => {
              const cancelled = await tx.order.updateMany({
                where: {
                  id: order.id,
                  status: {
                    in: [
                      "PENDING",
                      "PROCESSING",
                      "PARTIAL",
                    ],
                  },
                },
                data: {
                  status: "CANCELLED",
                  startCount: provider.startCount,
                  remains: provider.remains,
                },
              });

              if (cancelled.count !== 1) {
                return false;
              }

              await tx.user.update({
                where: {
                  id: order.userId,
                },
                data: {
                  balance: {
                    increment: order.charge,
                  },
                  totalSpent: {
                    decrement: order.charge,
                  },
                },
              });

              await tx.transaction.create({
                data: {
                  userId: order.userId,
                  type: "REFUND",
                  amount: order.charge,
                  note: `Refund for cancelled order #${order.id}`,
                },
              });

              return true;
            }
          );

          if (refundResult) {
            refunded++;
          }

          updated++;
          continue;
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
      {
        error: "Unable to sync orders.",
      },
      { status: 500 }
    );
  }
}