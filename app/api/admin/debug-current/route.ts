import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        platform: true,
        enabled: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        platform: true,
        enabled: true,
      },
      orderBy: { id: "asc" },
    }),
  ]);

  return NextResponse.json({
    serviceCount: services.length,
    categoryCount: categories.length,
    services,
    categories,
  });
}
