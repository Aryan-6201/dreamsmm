import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const services = await prisma.service.findMany({
    select: {
      category: true,
    },
  });

  const usedNames = new Set(
    services
      .map((s) => s.category?.trim().toLowerCase())
      .filter(Boolean)
  );

  const emptyCategoryIds = categories
    .filter((c) => !usedNames.has(c.name.trim().toLowerCase()))
    .map((c) => c.id);

  if (emptyCategoryIds.length === 0) {
    return NextResponse.json({
      deleted: 0,
      message: "No empty categories found.",
    });
  }

  const result = await prisma.category.deleteMany({
    where: {
      id: {
        in: emptyCategoryIds,
      },
    },
  });

  return NextResponse.json({
    deleted: result.count,
    remainingCategories: categories.length - result.count,
  });
}
