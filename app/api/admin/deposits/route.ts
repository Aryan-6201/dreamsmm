import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const session = await verifySession(token);

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const deposits = await prisma.depositRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      deposits: deposits.map((deposit) => ({
        id: deposit.id,
        amount: deposit.amount.toString(),
        utr: deposit.utr,
        status: deposit.status,
        createdAt: deposit.createdAt,
        user: deposit.user,
      })),
    });
  } catch (error) {
    console.error("Get deposits error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { depositId, action } = await request.json();
    const id = Number(depositId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit ID" },
        { status: 400 }
      );
    }

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const deposit = await tx.depositRequest.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          status: true,
        },
      });

      if (!deposit) {
        throw new Error("DEPOSIT_NOT_FOUND");
      }

      if (deposit.status !== "PENDING") {
        throw new Error("DEPOSIT_ALREADY_PROCESSED");
      }

      const now = new Date();

      if (action === "REJECT") {
        return tx.depositRequest.update({
          where: {
            id: deposit.id,
          },
          data: {
            status: "REJECTED",
            reviewedAt: now,
            reviewedBy: admin.id,
          },
          select: {
            id: true,
            status: true,
            reviewedAt: true,
            reviewedBy: true,
          },
        });
      }

      const user = await tx.user.findUnique({
        where: {
          id: deposit.userId,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (user.status === "BANNED") {
        throw new Error("USER_BANNED");
      }

      // Add the approved amount to the user's wallet.
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          balance: {
            increment: deposit.amount,
          },
        },
      });

      // Record the wallet credit.
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: deposit.amount,
          note: `UPI deposit #${deposit.id} approved`,
        },
      });

      // Mark the request as approved and record who reviewed it.
      return tx.depositRequest.update({
        where: {
          id: deposit.id,
        },
        data: {
          status: "APPROVED",
          reviewedAt: now,
          reviewedBy: admin.id,
        },
        select: {
          id: true,
          status: true,
          reviewedAt: true,
          reviewedBy: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      deposit: {
        id: result.id,
        status: result.status,
        reviewedAt: result.reviewedAt,
        reviewedBy: result.reviewedBy,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DEPOSIT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Deposit request not found." },
          { status: 404 }
        );
      }

      if (error.message === "DEPOSIT_ALREADY_PROCESSED") {
        return NextResponse.json(
          { error: "This deposit has already been processed." },
          { status: 400 }
        );
      }

      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { error: "User account not found." },
          { status: 404 }
        );
      }

      if (error.message === "USER_BANNED") {
        return NextResponse.json(
          { error: "This user's account is banned." },
          { status: 403 }
        );
      }
    }

    console.error("Process deposit error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}