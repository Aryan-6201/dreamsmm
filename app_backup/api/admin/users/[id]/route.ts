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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        balance: true,
        totalSpent: true,
        lastSeenAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const orders = await prisma.order.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        service: {
          select: {
            name: true,
            platform: true,
          },
        },
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        balance: user.balance.toString(),
        totalSpent: user.totalSpent.toString(),
      },

      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: transaction.amount.toString(),
      })),

      orders: orders.map((order) => ({
        ...order,
        charge: order.charge.toString(),
      })),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return NextResponse.json(
      { error: "Could not load user." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const action = String(body.action || "");
    const reason = String(body.reason || "").trim();

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (
      ["ADD_BALANCE", "REMOVE_BALANCE", "BONUS"].includes(action) &&
      (!body.amount ||
        !Number.isFinite(Number(body.amount)) ||
        Number(body.amount) <= 0)
    ) {
      return NextResponse.json(
        { error: "Enter a valid positive amount." },
        { status: 400 }
      );
    }

    if (
      ["ADD_BALANCE", "REMOVE_BALANCE", "BONUS"].includes(action) &&
      !reason
    ) {
      return NextResponse.json(
        { error: "A reason is required for money adjustments." },
        { status: 400 }
      );
    }

    if (action === "ADD_BALANCE") {
      const amount = Number(body.amount);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        await tx.transaction.create({
          data: {
            userId: id,
            type: "ADJUSTMENT",
            amount,
            note: `Admin balance addition: ${reason}`,
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "ADD_BALANCE",
            targetType: "USER",
            targetId: id,
            amount,
            reason,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `₹${amount.toFixed(2)} added to the user's balance.`,
      });
    }

    if (action === "REMOVE_BALANCE") {
      const amount = Number(body.amount);

      if (user.balance.lt(amount)) {
        return NextResponse.json(
          { error: "User does not have enough balance." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        await tx.transaction.create({
          data: {
            userId: id,
            type: "ADJUSTMENT",
            amount: -amount,
            note: `Admin balance deduction: ${reason}`,
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "REMOVE_BALANCE",
            targetType: "USER",
            targetId: id,
            amount,
            reason,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `₹${amount.toFixed(2)} removed from the user's balance.`,
      });
    }

    if (action === "BONUS") {
      const amount = Number(body.amount);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        await tx.bonus.create({
          data: {
            userId: id,
            amount,
            reason,
            createdBy: admin.id,
          },
        });

        await tx.transaction.create({
          data: {
            userId: id,
            type: "BONUS",
            amount,
            note: `Admin bonus: ${reason}`,
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "BONUS",
            targetType: "USER",
            targetId: id,
            amount,
            reason,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `₹${amount.toFixed(2)} bonus added.`,
      });
    }

    if (action === "SUSPEND") {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            status: "SUSPENDED",
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "SUSPEND_USER",
            targetType: "USER",
            targetId: id,
            reason: reason || "Suspended by administrator",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "User suspended.",
      });
    }

    if (action === "ACTIVATE") {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            status: "ACTIVE",
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "ACTIVATE_USER",
            targetType: "USER",
            targetId: id,
            reason: reason || "Activated by administrator",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "User activated.",
      });
    }

    if (action === "MAKE_ADMIN") {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            role: "ADMIN",
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "MAKE_ADMIN",
            targetType: "USER",
            targetId: id,
            reason: reason || "Promoted by administrator",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "User is now an administrator.",
      });
    }

    if (action === "REMOVE_ADMIN") {
      if (id === admin.id) {
        return NextResponse.json(
          { error: "You cannot remove your own admin access." },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            role: "USER",
          },
        });

        await tx.adminAction.create({
          data: {
            adminId: admin.id,
            action: "REMOVE_ADMIN",
            targetType: "USER",
            targetId: id,
            reason: reason || "Admin access removed",
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Admin access removed.",
      });
    }

    return NextResponse.json(
      { error: "Unknown action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin user action error:", error);

    return NextResponse.json(
      { error: "Could not update user." },
      { status: 500 }
    );
  }
}