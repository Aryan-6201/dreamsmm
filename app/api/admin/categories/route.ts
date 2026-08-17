import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const platform =
      typeof body.platform === "string"
        ? body.platform.trim()
        : "";

    if (!name || !platform) {
      return NextResponse.json(
        { error: "Category name and platform are required." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        platform,
        icon:
          typeof body.icon === "string"
            ? body.icon
            : "Sparkles",
        iconStyle:
          typeof body.iconStyle === "string"
            ? body.iconStyle
            : "outline",
        glowEnabled:
          typeof body.glowEnabled === "boolean"
            ? body.glowEnabled
            : true,
        glowIntensity:
          Number.isInteger(body.glowIntensity)
            ? body.glowIntensity
            : 50,
        badge:
          typeof body.badge === "string" &&
          body.badge.trim()
            ? body.badge.trim()
            : null,
        description:
          typeof body.description === "string" &&
          body.description.trim()
            ? body.description.trim()
            : null,
        enabled:
          typeof body.enabled === "boolean"
            ? body.enabled
            : true,
        sortOrder:
          Number.isInteger(body.sortOrder)
            ? body.sortOrder
            : 0,
      },
    });

    return NextResponse.json(
      { category },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Unable to create category." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid category ID is required." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      data.name = body.name.trim();
    }

    if (typeof body.platform === "string") {
      data.platform = body.platform.trim();
    }

    if (typeof body.icon === "string") {
      data.icon = body.icon;
    }

    if (typeof body.iconStyle === "string") {
      data.iconStyle = body.iconStyle;
    }

    if (typeof body.glowEnabled === "boolean") {
      data.glowEnabled = body.glowEnabled;
    }

    if (Number.isInteger(body.glowIntensity)) {
      data.glowIntensity = Math.max(
        0,
        Math.min(100, body.glowIntensity)
      );
    }

    if (typeof body.badge === "string") {
      data.badge = body.badge.trim() || null;
    }

    if (typeof body.description === "string") {
      data.description =
        body.description.trim() || null;
    }

    if (typeof body.enabled === "boolean") {
      data.enabled = body.enabled;
    }

    if (Number.isInteger(body.sortOrder)) {
      data.sortOrder = body.sortOrder;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Unable to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid category ID is required." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Unable to delete category." },
      { status: 500 }
    );
  }
}