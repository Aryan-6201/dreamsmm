import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const fixes = [
    {
      serviceId: 4197,
      category: "Facebook - 𝗣𝗼𝘀𝘁 Reaction 👍😍😡 [ Hidden Data ] [ Cheapest ] ᴺᴱᵂ",
      platform: "Facebook",
    },
    {
      serviceId: 4198,
      category: "IG Likes | Highest Quality Indian 🇮🇳",
      platform: "Instagram",
    },
  ];

  const results = [];

  for (const fix of fixes) {
    let category = await prisma.category.findFirst({
      where: { name: fix.category },
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
