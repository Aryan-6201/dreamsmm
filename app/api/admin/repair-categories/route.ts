import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const fixes = [
    {
      serviceId: 4191,
      category: "Instagram - Save/Repost/Comment/Followers/Views ???",
      platform: "Instagram",
    },
    {
      serviceId: 4194,
      category: "Instagram - Comment [ Cheapest ] ᴺᴱᵂ",
      platform: "Instagram",
    },
    {
      serviceId: 4195,
      category: "YouTube - Likes [ Low Drop - Cheapest ] ᴺᴱᵂ",
      platform: "YouTube",
    },
    {
      serviceId: 4196,
      category: "Whatsapp - Channel Members [ Cheapest ] ᴺᴱᵂ",
      platform: "Other",
    },
  ];

  const results = [];

  for (const fix of fixes) {
    let category = await prisma.category.findFirst({
      where: {
        name: fix.category,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: fix.category,
          platform: fix.platform,
          enabled: true,
          sortOrder: 0,
        },
      });
    }

    const service = await prisma.service.update({
      where: { id: fix.serviceId },
      data: {
        category: category.name,
      },
    });

    results.push({
      serviceId: service.id,
      categoryId: category.id,
      category: category.name,
    });
  }

  return NextResponse.json({
    success: true,
    results,
  });
}
