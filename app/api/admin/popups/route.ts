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

// GET - List all popups
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
      include: {
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    return NextResponse.json({
      popups: popups.map((popup) => ({
        ...popup,
        recipientCount: popup._count.recipients,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Admin popups GET error:", error);

    return NextResponse.json(
      { error: "Could not load popups." },
      { status: 500 }
    );
  }
}

// POST - Create popup
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null;

    const buttonText =
      typeof body.buttonText === "string" && body.buttonText.trim()
        ? body.buttonText.trim()
        : null;

    const buttonUrl =
      typeof body.buttonUrl === "string" && body.buttonUrl.trim()
        ? body.buttonUrl.trim()
        : null;

    const targetType =
      body.targetType === "SPECIFIC" ? "SPECIFIC" : "ALL";

    const active =
      typeof body.active === "boolean" ? body.active : true;

    const showOnce =
      typeof body.showOnce === "boolean" ? body.showOnce : true;

    const expiresAt =
      typeof body.expiresAt === "string" && body.expiresAt.trim()
        ? new Date(body.expiresAt)
        : null;

    const userIds: string[] = Array.isArray(body.userIds)
      ? body.userIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.trim().length > 0
        )
      : [];

    const uniqueUserIds: string[] = Array.from(new Set(userIds));

    if (!title) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (targetType === "SPECIFIC" && uniqueUserIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one user is required for a specific popup.",
        },
        { status: 400 }
      );
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date." },
        { status: 400 }
      );
    }

    if (targetType === "SPECIFIC") {
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: uniqueUserIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (users.length !== uniqueUserIds.length) {
        return NextResponse.json(
          { error: "One or more selected users do not exist." },
          { status: 400 }
        );
      }
    }

    const popup = await prisma.$transaction(async (tx) => {
      const createdPopup = await tx.popup.create({
        data: {
          title,
          message,
          imageUrl,
          buttonText,
          buttonUrl,
          targetType,
          active,
          showOnce,
          expiresAt,
        },
      });

      if (targetType === "SPECIFIC") {
        await tx.popupRecipient.createMany({
          data: uniqueUserIds.map((userId) => ({
            popupId: createdPopup.id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      return createdPopup;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Popup created successfully.",
        popup,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin popups POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create popup.",
      },
      { status: 500 }
    );
  }
}
// PATCH - Update popup / toggle active state
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

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid popup ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.popup.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Popup not found." },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (typeof body.message === "string") {
      const message = body.message.trim();

      if (!message) {
        return NextResponse.json(
          { error: "Message cannot be empty." },
          { status: 400 }
        );
      }

      data.message = message;
    }

    if (body.imageUrl !== undefined) {
      data.imageUrl =
        typeof body.imageUrl === "string" && body.imageUrl.trim()
          ? body.imageUrl.trim()
          : null;
    }

    if (body.buttonText !== undefined) {
      data.buttonText =
        typeof body.buttonText === "string" && body.buttonText.trim()
          ? body.buttonText.trim()
          : null;
    }

    if (body.buttonUrl !== undefined) {
      data.buttonUrl =
        typeof body.buttonUrl === "string" && body.buttonUrl.trim()
          ? body.buttonUrl.trim()
          : null;
    }

    if (body.targetType === "ALL" || body.targetType === "SPECIFIC") {
      data.targetType = body.targetType;
    }

    if (
      body.type === "ANNOUNCEMENT" ||
      body.type === "SUCCESS" ||
      body.type === "OFFER" ||
      body.type === "WARNING" ||
      body.type === "MAINTENANCE"
    ) {
      data.type = body.type;
    }

    if (
      body.theme === "CYAN" ||
      body.theme === "VIOLET" ||
      body.theme === "GREEN" ||
      body.theme === "ORANGE" ||
      body.theme === "RED" ||
      body.theme === "DARK"
    ) {
      data.theme = body.theme;
    }

    if (typeof body.active === "boolean") {
      data.active = body.active;
    }

    if (typeof body.showOnce === "boolean") {
      data.showOnce = body.showOnce;
    }

    if (body.priority !== undefined) {
      const priority = Number(body.priority);

      if (!Number.isInteger(priority)) {
        return NextResponse.json(
          { error: "Priority must be an integer." },
          { status: 400 }
        );
      }

      data.priority = priority;
    }

    if (body.autoClose !== undefined) {
      if (body.autoClose === null || body.autoClose === "") {
        data.autoClose = null;
      } else {
        const autoClose = Number(body.autoClose);

        if (!Number.isInteger(autoClose) || autoClose < 0) {
          return NextResponse.json(
            { error: "Auto-close must be 0 or a positive number." },
            { status: 400 }
          );
        }

        data.autoClose = autoClose;
      }
    }

    if (body.expiresAt !== undefined) {
      if (!body.expiresAt) {
        data.expiresAt = null;
      } else {
        const expiresAt = new Date(body.expiresAt);

        if (Number.isNaN(expiresAt.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiry date." },
            { status: 400 }
          );
        }

        data.expiresAt = expiresAt;
      }
    }

    const popup = await prisma.popup.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Popup updated successfully.",
      popup,
    });
  } catch (error) {
    console.error("Admin popups PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update popup.",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete popup
export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid popup ID is required." },
        { status: 400 }
      );
    }

    const popup = await prisma.popup.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!popup) {
      return NextResponse.json(
        { error: "Popup not found." },
        { status: 404 }
      );
    }

    await prisma.popup.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Popup deleted successfully.",
    });
  } catch (error) {
    console.error("Admin popups DELETE error:", error);

    return NextResponse.json(
      { error: "Could not delete popup." },
      { status: 500 }
    );
  }
}