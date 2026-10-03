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

    const popups = await prisma.popup.findMany({
      where: {
        active: true,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
          {
            OR: [
              { targetType: "ALL" },
              {
                targetType: "SPECIFIC",
                recipients: {
                  some: {
                    userId: session.userId,
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        recipients: {
          where: {
            userId: session.userId,
          },
          select: {
            dismissedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const visiblePopups = popups.filter((popup) => {
      if (!popup.showOnce) {
        return true;
      }

      const recipient = popup.recipients[0];

      return !recipient?.dismissedAt;
    });

    return NextResponse.json({
      success: true,
      popups: visiblePopups.map((popup) => ({
        id: popup.id,
        title: popup.title,
        message: popup.message,
        imageUrl: popup.imageUrl,
        buttonText: popup.buttonText,
        buttonUrl: popup.buttonUrl,
        showOnce: popup.showOnce,
        expiresAt: popup.expiresAt
          ? popup.expiresAt.toISOString()
          : null,
      })),
    });
  } catch (error) {
    console.error("GET POPUPS ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load popups." },
      { status: 500 }
    );
  }
}