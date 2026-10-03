import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { id: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      category: true,
      platform: true,
      providerName: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { id: "desc" },
    select: {
      id: true,
      name: true,
      platform: true,
      enabled: true,
    },
  });

  return NextResponse.json({ services, categories });
}
