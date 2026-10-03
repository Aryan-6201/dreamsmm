import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      category: true,
      platform: true,
      enabled: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      platform: true,
    },
  });

  const normalize = (value: string | null | undefined) =>
    (value || "").normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

  const missing = services.filter(
    (service) =>
      !categories.some(
        (category) =>
          normalize(service.category) === normalize(category.name)
      )
  );

  return NextResponse.json({
    missing,
    categories,
  });
}
