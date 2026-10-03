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

    const body = await request.json().catch(() => ({}));
    const popupId = Number(body.popupId);

    if (!Number.isInteger(popupId) || popupId <= 0) {
      return NextResponse.json(
        { error: "Valid popup ID is required." },
        { status: 400 }
      );
    }

    const popup = await prisma.popup.findUnique({
      where: {
        id: popupId,
      },
      select: {
        id: true,
        targetType: true,
        showOnce: true,
      },
    });

    if (!popup) {
      return NextResponse.json(
        { error: "Popup not found." },
        { status: 404 }
      );
    }

    // ALL popups don't have individual recipient rows.
    // Create one only when the popup needs per-user dismissal.
    await prisma.popupRecipient.upsert({
      where: {
        popupId_userId: {
          popupId,
          userId: session.userId,
        },
      },
      update: {
        dismissedAt: new Date(),
      },
      create: {
        popupId,
        userId: session.userId,
        dismissedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Popup dismissed.",
    });
  } catch (error) {
    console.error("DISMISS POPUP ERROR:", error);

    return NextResponse.json(
      { error: "Unable to dismiss popup." },
      { status: 500 }
    );
  }
}