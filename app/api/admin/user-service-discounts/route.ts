import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const discounts = await prisma.userServiceDiscount.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ discounts });
  } catch (error) {
    console.error("GET user service discounts:", error);
    return NextResponse.json(
      { error: "Unauthorized or failed to load discounts" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const userId =
      typeof body.userId === "string" ? body.userId.trim() : "";

    const serviceId = Number(body.serviceId);
    const type = body.type;
    const value = Number(body.value);

    const enabled =
      body.enabled === undefined ? true : Boolean(body.enabled);

    let expiresAt: Date | null = null;

    if (body.expiresAt) {
      expiresAt = new Date(body.expiresAt);

      if (Number.isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiresAt" },
          { status: 400 }
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { error: "Invalid serviceId" },
        { status: 400 }
      );
    }

    if (type !== "FIXED" && type !== "PERCENTAGE") {
      return NextResponse.json(
        { error: "type must be FIXED or PERCENTAGE" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "Invalid discount value" },
        { status: 400 }
      );
    }

    if (type === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.userServiceDiscount.findFirst({
      where: {
        userId,
        serviceId,
      },
      select: { id: true },
    });

    const discount = existing
      ? await prisma.userServiceDiscount.update({
          where: { id: existing.id },
          data: {
            type,
            value,
            expiresAt,
            enabled,
          },
        })
      : await prisma.userServiceDiscount.create({
          data: {
            userId,
            serviceId,
            type,
            value,
            expiresAt,
            enabled,
          },
        });

    return NextResponse.json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error("POST user service discount:", error);

    return NextResponse.json(
      { error: "Failed to save discount" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid discount id" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.type !== undefined) {
      if (
        body.type !== "FIXED" &&
        body.type !== "PERCENTAGE"
      ) {
        return NextResponse.json(
          { error: "Invalid discount type" },
          { status: 400 }
        );
      }

      data.type = body.type;
    }

    if (body.value !== undefined) {
      const value = Number(body.value);

      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: "Invalid discount value" },
          { status: 400 }
        );
      }

      data.value = value;
    }

    if (body.enabled !== undefined) {
      data.enabled = Boolean(body.enabled);
    }

    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt
        ? new Date(body.expiresAt)
        : null;
    }

    const discount = await prisma.userServiceDiscount.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error("PATCH user service discount:", error);

    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid discount id" },
        { status: 400 }
      );
    }

    await prisma.userServiceDiscount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE user service discount:", error);

    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}
