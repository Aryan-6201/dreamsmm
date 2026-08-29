import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { createVipSmmRefill } from "@/lib/providers/vipsmm";

export async function POST(request: Request) {
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

    const body = await request.json();
    const orderId = Number(body.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "Valid order ID is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.userId,
      },
      include: {
        service: {
          select: {
            providerName: true,
            refill: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (!order.providerId) {
      return NextResponse.json(
        { error: "Provider order ID is missing." },
        { status: 400 }
      );
    }

    if (!order.service?.refill) {
      return NextResponse.json(
        { error: "Refill is not available for this service." },
        { status: 400 }
      );
    }

    if (
      !order.service.providerName?.toUpperCase().startsWith("VIPSMM")
    ) {
      return NextResponse.json(
        { error: "Refill is currently supported only for VIPSMM orders." },
        { status: 400 }
      );
    }

    const result = await createVipSmmRefill(order.providerId);

    return NextResponse.json({
      success: true,
      message: "Refill request created successfully.",
      refillId: result.refillId,
      orderId: order.id,
    });
  } catch (error) {
    console.error("REFILL ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create refill.",
      },
      { status: 502 }
    );
  }
}
