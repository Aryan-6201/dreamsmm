import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const VALID_TYPES = [
  "DEPOSIT",
  "ORDER",
  "REFUND",
  "ADJUSTMENT",
  "BONUS",
  "WITHDRAWAL",
] as const;

type TransactionType = (typeof VALID_TYPES)[number];

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ error: "Your session has expired." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedPage = Number(searchParams.get("page") || "1");
    const requestedLimit = Number(searchParams.get("limit") || "10");
    const type = searchParams.get("type") || "ALL";

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isInteger(requestedLimit)
        ? Math.min(20, Math.max(5, requestedLimit))
        : 10;

    if (type !== "ALL" && !VALID_TYPES.includes(type as TransactionType)) {
      return NextResponse.json(
        { error: "Invalid transaction type." },
        { status: 400 }
      );
    }

    const where = {
      userId: session.userId,
      ...(type !== "ALL"
        ? { type: type as TransactionType }
        : {}),
    };

    const [transactions, total, user] = await prisma.$transaction([
      prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
      prisma.user.findUnique({
        where: {
          id: session.userId,
        },
        select: {
          balance: true,
          totalSpent: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: {
        balance: user.balance.toString(),
        totalSpent: user.totalSpent.toString(),
      },
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        note: transaction.note,
        createdAt: transaction.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load wallet activity." },
      { status: 500 }
    );
  }
}