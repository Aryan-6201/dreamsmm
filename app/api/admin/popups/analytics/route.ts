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

    const popups = await prisma.popup.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        active: true,
        createdAt: true,
        events: {
          select: {
            type: true,
          },
        },
      },
    });

    const analytics = popups.map((popup) => {
      const views = popup.events.filter(
        (event) => event.type === "VIEW"
      ).length;

      const clicks = popup.events.filter(
        (event) => event.type === "CLICK"
      ).length;

      const dismisses = popup.events.filter(
        (event) => event.type === "DISMISS"
      ).length;

      const ctr =
        views > 0
          ? Number(((clicks / views) * 100).toFixed(2))
          : 0;

      return {
        id: popup.id,
        title: popup.title,
        active: popup.active,
        createdAt: popup.createdAt,
        views,
        clicks,
        dismisses,
        ctr,
      };
    });

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("POPUP ANALYTICS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load analytics." },
      { status: 500 }
    );
  }
}