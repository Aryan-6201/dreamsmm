import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getVipsmmServices } from "@/lib/providers/vipsmm";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const session = await verifySession(token);

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getPlatform(service: {
  name: string;
  platform?: string;
  category?: string;
}) {
  const text = [
    service.platform || "",
    service.name || "",
    service.category || "",
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("instagram")) return "Instagram";
  if (text.includes("youtube")) return "YouTube";
  if (text.includes("tiktok")) return "TikTok";
  if (text.includes("facebook")) return "Facebook";
  if (text.includes("telegram")) return "Telegram";
  if (text.includes("twitter") || text.includes(" x ")) return "Twitter";
  if (text.includes("spotify")) return "Spotify";
  if (text.includes("reddit")) return "Reddit";

  return cleanText(service.platform) || "Other";
}

function cleanCategory(value: unknown, platform: string) {
  const category = cleanText(value);

  if (category) return category;

  return platform;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const markupPercent = Number(body.markupPercent ?? 25);

    if (
      !Number.isFinite(markupPercent) ||
      markupPercent < 0 ||
      markupPercent > 1000
    ) {
      return NextResponse.json(
        { error: "Invalid markup percentage." },
        { status: 400 }
      );
    }

    const autoSync =
      typeof body.autoSync === "boolean"
        ? body.autoSync
        : true;

    const providerServices = await getVipsmmServices();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let categoriesCreated = 0;

    for (const providerService of providerServices) {
      const providerId = String(providerService.service).trim();

      if (!providerId || !providerService.name) {
        skipped++;
        continue;
      }

      const providerRate = Number(providerService.rate);
      const min = Number(providerService.min);
      const max = Number(providerService.max);

      if (
        !Number.isFinite(providerRate) ||
        providerRate < 0 ||
        !Number.isInteger(min) ||
        min <= 0 ||
        !Number.isInteger(max) ||
        max < min
      ) {
        skipped++;
        continue;
      }

      const platform = getPlatform({
        name: providerService.name,
        platform: "",
        category: providerService.category,
      });

      const category = cleanCategory(
        providerService.category,
        platform
      );

      const customerRate =
        providerRate * (1 + markupPercent / 100);

      const description =
        cleanText(providerService.description) || null;

      /*
       * Automatically create the category configuration
       * if it doesn't already exist.
       */
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: category,
            mode: "insensitive",
          },
        },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            name: category,
            platform,
            enabled: true,
            sortOrder: 0,
          },
        });

        categoriesCreated++;
      }

      const existingService =
        await prisma.service.findFirst({
          where: {
            providerName: "MKAPI",
            providerId,
          },
        });

      if (existingService) {
        await prisma.service.update({
          where: {
            id: existingService.id,
          },
          data: {
            name: providerService.name.trim(),
            platform,
            category,
            description,
            min,
            max,
            refill:
              providerService.refill === true ||
              providerService.refill === "true",
            providerRate,
            markupPercent,
            autoSync,
            ...(autoSync
              ? {
                  rate: customerRate,
                }
              : {}),
          },
        });

        updated++;
      } else {
        await prisma.service.create({
          data: {
            name: providerService.name.trim(),
            platform,
            category,
            description,
            rate: customerRate,
            min,
            max,
            enabled: true,
            refill:
              providerService.refill === true ||
              providerService.refill === "true",
            providerId,
            providerName: "MKAPI",
            providerRate,
            markupPercent,
            autoSync,
          },
        });

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "MKAPI services imported successfully.",
      totalFromProvider: providerServices.length,
      created,
      updated,
      skipped,
      categoriesCreated,
      markupPercent,
      autoSync,
    });
  } catch (error) {
    console.error("MKAPI import error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import MKAPI services.",
      },
      { status: 500 }
    );
  }
}