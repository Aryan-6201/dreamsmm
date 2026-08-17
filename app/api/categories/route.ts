import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        enabled: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        platform: true,
        icon: true,
        iconStyle: true,
        glowEnabled: true,
        glowIntensity: true,
        badge: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET PUBLIC CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load categories." },
      { status: 500 }
    );
  }
}