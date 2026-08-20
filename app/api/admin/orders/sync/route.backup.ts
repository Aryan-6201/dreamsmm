import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMicoSmmOrderStatus } from "@/lib/providers/micosmm";
import { getVipsmmOrderStatus } from "@/lib/providers/vipsmm";

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
        providerId: true,
      },
      take: 50,
    });

    let updated = 0;
    let failed = 0;

    for (const order of orders) {
      if (!order.providerId) continue;

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