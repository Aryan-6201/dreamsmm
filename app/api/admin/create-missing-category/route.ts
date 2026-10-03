import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const name = "Instagram - Save/Repost/Comment/Followers/Views ???";

  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return NextResponse.json({
      success: true,
      created: false,
      category: existing,
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      platform: "Instagram",
      enabled: true,
      sortOrder: 0,
    },
  });

  return NextResponse.json({
    success: true,
    created: true,
    category,
  });
}
