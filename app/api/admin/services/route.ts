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
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const services = await prisma.service.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      services: services.map((service) => ({
        id: service.id,
        name: service.name,
        platform: service.platform,
        category: service.category,
        description: service.description,
        rate: service.rate.toString(),
        min: service.min,
        max: service.max,
        enabled: service.enabled,
        refill: service.refill,
        providerId: service.providerId,
        providerName: service.providerName,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get admin services error:", error);

    return NextResponse.json(
      { error: "Unable to load services." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const platform =
      typeof body.platform === "string"
        ? body.platform.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const providerId =
      typeof body.providerId === "string"
        ? body.providerId.trim()
        : "";

    const providerName =
      typeof body.providerName === "string"
        ? body.providerName.trim()
        : "";

    const rate = Number(body.rate);
    const min = Number(body.min);
    const max = Number(body.max);

    if (
      !name ||
      !platform ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      !Number.isInteger(min) ||
      min <= 0 ||
      !Number.isInteger(max) ||
      max < min
    ) {
      return NextResponse.json(
        { error: "Invalid service details." },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        platform,
        category: category || null,
        description: description || null,
        rate,
        min,
        max,
        enabled: body.enabled !== false,
        refill: body.refill === true,
        providerId: providerId || null,
        providerName: providerName || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        service: {
          ...service,
          rate: service.rate.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin service error:", error);

    return NextResponse.json(
      { error: "Unable to create service." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Service not found." },
        { status: 404 }
      );
    }

    const data: any = {};

    if (typeof body.name === "string") {
      data.name = body.name.trim();
    }

    if (typeof body.platform === "string") {
      data.platform = body.platform.trim();
    }

    if (typeof body.category === "string") {
      data.category = body.category.trim() || null;
    }

    if (typeof body.description === "string") {
      data.description = body.description.trim() || null;
    }

    if (typeof body.providerId === "string") {
      data.providerId = body.providerId.trim() || null;
    }

    if (typeof body.providerName === "string") {
      data.providerName = body.providerName.trim() || null;
    }

    if (typeof body.enabled === "boolean") {
      data.enabled = body.enabled;
    }

    if (typeof body.refill === "boolean") {
      data.refill = body.refill;
    }

    if (body.rate !== undefined) {
      const rate = Number(body.rate);

      if (!Number.isFinite(rate) || rate < 0) {
        return NextResponse.json(
          { error: "Invalid rate." },
          { status: 400 }
        );
      }

      data.rate = rate;
    }

    if (body.min !== undefined) {
      const min = Number(body.min);

      if (!Number.isInteger(min) || min <= 0) {
        return NextResponse.json(
          { error: "Invalid minimum quantity." },
          { status: 400 }
        );
      }

      data.min = min;
    }

    if (body.max !== undefined) {
      const max = Number(body.max);

      if (!Number.isInteger(max) || max <= 0) {
        return NextResponse.json(
          { error: "Invalid maximum quantity." },
          { status: 400 }
        );
      }

      data.max = max;
    }

    const finalMin = data.min ?? existing.min;
    const finalMax = data.max ?? existing.max;

    if (finalMax < finalMin) {
      return NextResponse.json(
        {
          error:
            "Maximum quantity must be greater than or equal to minimum.",
        },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      service: {
        ...service,
        rate: service.rate.toString(),
      },
    });
  } catch (error) {
    console.error("Update admin service error:", error);

    return NextResponse.json(
      { error: "Unable to update service." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    const orderCount = await prisma.order.count({
      where: {
        serviceId: id,
      },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          error:
            "This service has orders. Disable it instead of deleting it.",
        },
        { status: 409 }
      );
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin service error:", error);

    return NextResponse.json(
      { error: "Unable to delete service." },
      { status: 500 }
    );
  }
}