import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    where: {
      id: { in: [4190, 4191, 4192] },
    },
    select: {
      id: true,
      name: true,
      category: true,
      platform: true,
      enabled: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    services: services.map((s) => ({
      id: s.id,
      category: s.category ?? null,
      categoryLength: s.category?.length ?? 0,
      platform: s.platform,
      enabled: s.enabled,
    })),
  });
}
