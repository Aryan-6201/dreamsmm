import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
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
        { error: "Your session has expired." },
        { status: 401 }
      );
    }

    const now = new Date();

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        id: true,
        discountPercent: true,
        userServiceDiscounts: {
          where: {
            enabled: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
          select: {
            serviceId: true,
            type: true,
            value: true,
            expiresAt: true,
            enabled: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        discountPercent: user.discountPercent.toString(),
        userServiceDiscounts: user.userServiceDiscounts.map((discount) => ({
          serviceId: discount.serviceId,
          type: discount.type,
          value: discount.value.toString(),
          expiresAt: discount.expiresAt
            ? discount.expiresAt.toISOString()
            : null,
          enabled: discount.enabled,
        })),
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load user information." },
      { status: 500 }
    );
  }
}

