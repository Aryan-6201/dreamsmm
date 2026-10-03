import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const source = await prisma.service.findUnique({
    where: { id: 4192 },
    select: { category: true },
  });

  if (!source?.category) {
    return NextResponse.json(
      { error: "Source service 4192 has no category." },
      { status: 400 }
    );
  }

  const updated = await prisma.service.update({
    where: { id: 4191 },
    data: {
      category: source.category,
    },
  });

  return NextResponse.json({
    success: true,
    serviceId: updated.id,
    category: updated.category,
  });
}
