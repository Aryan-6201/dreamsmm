import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getVipsmmService } from "@/lib/providers/vipsmm";

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
  category?: string;
}) {
  const text = [
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

  return "Other";
}

function cleanCategory(
  value: unknown,
  platform: string
): string {
  const category = cleanText(value);

  return category || platform;
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

    const action =
      typeof body.action === "string"
        ? body.action
        : "";

    const serviceId =
      typeof body.serviceId === "string"
        ? body.serviceId.trim()
        : "";

    if (!serviceId) {
      return NextResponse.json(
        { error: "VIPSMMPro service ID is required." },
        { status: 400 }
      );
    }

    /*
     * FETCH ONLY ONE SERVICE
     */
    const providerService = await getVipsmmService(serviceId);

    if (action === "fetch") {
      return NextResponse.json({
        success: true,
        service: {
          service: String(providerService.service),
          name: providerService.name,
          type: providerService.type,
          category: providerService.category,
          description: providerService.description,
          rate: String(providerService.rate),
          min: Number(providerService.min),
          max: Number(providerService.max),
          refill: providerService.refill,
        },
      });
    }

    /*
     * IMPORT ONE SERVICE
     */
    if (action !== "import") {
      return NextResponse.json(
        { error: "Invalid import action." },
        { status: 400 }
      );
    }

    const markupPercent = Number(
      body.markupPercent ?? 25
    );

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

    const providerId =
      String(providerService.service).trim();

    const providerRate =
      Number(providerService.rate);

    const min =
      Number(providerService.min);

    const max =
      Number(providerService.max);

    if (
      !providerService.name ||
      !Number.isFinite(providerRate) ||
      providerRate < 0 ||
      !Number.isInteger(min) ||
      min <= 0 ||
      !Number.isInteger(max) ||
      max < min
    ) {
      return NextResponse.json(
        { error: "VIPSMMPro returned invalid service details." },
        { status: 400 }
      );
    }

    const platform = getPlatform({
      name: providerService.name,
      category: providerService.category,
    });

    const category = cleanCategory(
      providerService.category,
      platform
    );

    const description =
      cleanText(providerService.description) || null;

    const customerRate =
      providerRate *
      (1 + markupPercent / 100);

    /*
     * Create category if needed
     */
    const existingCategory =
      await prisma.category.findFirst({
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
    }

    /*
     * Check if this exact VIPSMMPro service
     * already exists.
     */
    const existingService =
      await prisma.service.findFirst({
        where: {
          providerName: "VIPSMMPro",
          providerId,
        },
      });

    if (existingService) {
      const service =
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

      return NextResponse.json({
        success: true,
        message:
          "VIPSMMPro service updated successfully.",
        created: false,
        updated: true,
        service: {
          ...service,
          rate: service.rate.toString(),
        },
      });
    }

    /*
     * Create new service
     */
    const service =
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
          providerName: "VIPSMMPro",
          providerRate,
          markupPercent,
          autoSync,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "VIPSMMPro service imported successfully.",
      created: true,
      updated: false,
      service: {
        ...service,
        rate: service.rate.toString(),
      },
    });
  } catch (error) {
    console.error(
      "VIPSMMPro service import error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import VIPSMMPro service.",
      },
      { status: 500 }
    );
  }
}

