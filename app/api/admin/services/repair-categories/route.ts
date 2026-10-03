import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

import {
  ensureServiceCategory,
  normalizeCategoryName,
} from "@/lib/admin/ensure-service-category";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const session =
      cookieStore.get("session")?.value;

    if (!session || !verifySession(session)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const services =
      await prisma.service.findMany({
        select: {
          id: true,
          category: true,
          platform: true,
        },
      });

    let repaired = 0;

    for (const service of services) {

      const category =
        normalizeCategoryName(service.category) ||
        normalizeCategoryName(service.platform) ||
        "Other Services";

      const ensured =
        await ensureServiceCategory(
          category,
          service.platform
        );

      if (service.category !== ensured.name) {

        await prisma.service.update({
          where: {
            id: service.id,
          },
          data: {
            category: ensured.name,
          },
        });

        repaired++;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: services.length,
      repaired,
    });

  } catch (error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Repair failed.",
      },
      { status: 500 }
    );
  }
}
