import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }

    const event = await prisma.balanceCreditEvent.findFirst({
      where: {
        userId: session.userId,
        consumed: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!event) {
      return NextResponse.json({
        success: true,
        event: null,
      });
    }

    await prisma.balanceCreditEvent.update({
      where: {
        id: event.id,
      },
      data: {
        consumed: true,
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        amount: event.amount.toString(),
        eventType: event.eventType,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("BALANCE CREDIT EVENT ERROR:", error);

    return NextResponse.json(
      { error: "Unable to check balance notification." },
      { status: 500 }
    );
  }
}
