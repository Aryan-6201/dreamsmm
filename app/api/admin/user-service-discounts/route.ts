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

    const discounts = await prisma.userServiceDiscount.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json({
      discounts: discounts.map((discount) => ({
        ...discount,
        value: discount.value.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin service discounts GET error:", error);

    return NextResponse.json(
      { error: "Could not load service discounts." },
      { status: 500 }
    );
  }
}

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

    const userId =
      typeof body.userId === "string"
        ? body.userId.trim()
        : "";

    const serviceId = Number(body.serviceId);
    const type = body.type;
    const value = Number(body.value);

    const enabled =
      body.enabled === undefined
        ? true
        : Boolean(body.enabled);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    if (type !== "FIXED" && type !== "PERCENTAGE") {
      return NextResponse.json(
        { error: "Discount type must be FIXED or PERCENTAGE." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: "Discount value must be 0 or greater." },
        { status: 400 }
      );
    }

    if (type === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { error: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const [user, service] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    let expiresAt: Date | null = null;

    if (body.expiresAt) {
      expiresAt = new Date(body.expiresAt);

      if (Number.isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiry date." },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.userServiceDiscount.findFirst({
      where: {
        userId,
        serviceId,
      },
      select: {
        id: true,
      },
    });

    const discount = existing
      ? await prisma.userServiceDiscount.update({
          where: {
            id: existing.id,
          },
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
      message: "Service discount saved successfully.",
      discount: {
        ...discount,
        value: discount.value.toString(),
      },
    });
  } catch (error) {
    console.error("Admin service discount POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save service discount.",
      },
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

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid discount ID." },
        { status: 400 }
      );
    }

    const data: {
      type?: "FIXED" | "PERCENTAGE";
      value?: number;
      expiresAt?: Date | null;
      enabled?: boolean;
    } = {};

    if (body.type !== undefined) {
      if (
        body.type !== "FIXED" &&
        body.type !== "PERCENTAGE"
      ) {
        return NextResponse.json(
          { error: "Invalid discount type." },
          { status: 400 }
        );
      }

      data.type = body.type;
    }

    if (body.value !== undefined) {
      const value = Number(body.value);

      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json(
          { error: "Invalid discount value." },
          { status: 400 }
        );
      }

      if (data.type === "PERCENTAGE" && value > 100) {
        return NextResponse.json(
          { error: "Percentage discount cannot exceed 100%." },
          { status: 400 }
        );
      }

      data.value = value;
    }

    if (body.enabled !== undefined) {
      data.enabled = Boolean(body.enabled);
    }

    if (body.expiresAt !== undefined) {
      if (!body.expiresAt) {
        data.expiresAt = null;
      } else {
        const date = new Date(body.expiresAt);

        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiry date." },
            { status: 400 }
          );
        }

        data.expiresAt = date;
      }
    }

    const discount =
      await prisma.userServiceDiscount.update({
        where: {
          id,
        },
        data,
      });

    return NextResponse.json({
      success: true,
      message: "Service discount updated successfully.",
      discount: {
        ...discount,
        value: discount.value.toString(),
      },
    });
  } catch (error) {
    console.error("Admin service discount PATCH error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update service discount.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid discount ID." },
        { status: 400 }
      );
    }

    await prisma.userServiceDiscount.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service discount deleted successfully.",
    });
  } catch (error) {
    console.error("Admin service discount DELETE error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not delete service discount.",
      },
      { status: 500 }
    );
  }
}



