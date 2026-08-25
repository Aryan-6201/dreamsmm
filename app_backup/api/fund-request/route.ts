import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const { amount, utr } = await request.json();

    const parsedAmount = Number(amount);
    const cleanUtr = String(utr || "").trim();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid amount." },
        { status: 400 }
      );
    }

    if (parsedAmount < 10) {
      return NextResponse.json(
        { error: "Minimum deposit is ₹10." },
        { status: 400 }
      );
    }

    if (!cleanUtr) {
      return NextResponse.json(
        { error: "UTR / transaction ID is required." },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.depositRequest.findUnique({
      where: {
        utr: cleanUtr,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "This UTR has already been submitted." },
        { status: 400 }
      );
    }

    const deposit = await prisma.depositRequest.create({
      data: {
        userId: session.userId,
        amount: parsedAmount,
        utr: cleanUtr,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit request submitted successfully.",
      deposit: {
        id: deposit.id,
        amount: deposit.amount.toString(),
        status: deposit.status,
      },
    });
  } catch (error) {
    console.error("Deposit request error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
