import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const session = await verifySession(token);

  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    return null;
  }

  return admin;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        balance: true,
        totalSpent: true,
        discountPercent: true,
        lastSeenAt: true,
        lastLoginAt: true,
        createdAt: true,

        _count: {
          select: {
            orders: true,
            transactions: true,
          },
        },
      },
    });

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        balance: user.balance.toString(),
        totalSpent: user.totalSpent.toString(),
        discountPercent: user.discountPercent.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return NextResponse.json(
      { error: "Could not load users." },
      { status: 500 }
    );
  }
}
export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const discountPercent = Number(body.discountPercent);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      return NextResponse.json(
        { error: "Discount must be between 0% and 100%." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        discountPercent,
      },
      select: {
        id: true,
        discountPercent: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User discount updated successfully.",
      user: {
        id: user.id,
        discountPercent: user.discountPercent.toString(),
      },
    });
  } catch (error) {
    console.error("Admin user discount error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update user discount.",
      },
      { status: 500 }
    );
  }
}