import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getVipSmmService } from "@/lib/providers/vipsmm";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;

  return user;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getPlatform(name: string, category?: string) {
  const text = `${name} ${category || ""}`.toLowerCase();

  if (text.includes("instagram")) return "Instagram";
  if (text.includes("youtube")) return "YouTube";
  if (text.includes("tiktok")) return "TikTok";
  if (text.includes("facebook")) return "Facebook";
  if (text.includes("telegram")) return "Telegram";
  if (text.includes("twitter") || text.includes(" x "))
    return "Twitter";
  if (text.includes("spotify")) return "Spotify";
  if (text.includes("reddit")) return "Reddit";

  return "Other";
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
        { error: "VIPSMM service ID is required." },
        { status: 400 }
      );
    }

    const providerService =
      await getVipSmmService(serviceId);

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
          cancel: providerService.cancel,
        },
      });
    }

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

    const min = Number(providerService.min);
    const max = Number(providerService.max);

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
        { error: "VIPSMM returned invalid service details." },
        { status: 400 }
      );
    }

    const platform = getPlatform(
      providerService.name,
      providerService.category
    );

    const category =
      cleanText(providerService.category) || platform;

    const description =
      cleanText(providerService.description) || null;

    const customerRate =
      providerRate * (1 + markupPercent / 100);

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

    const existingService =
      await prisma.service.findFirst({
        where: {
          providerName: "VIPSMM",
          providerId,
        },
      });

    const refill =
      providerService.refill === true ||
      providerService.refill === "true";

    if (existingService) {
      const service =
        await prisma.service.update({
          where: { id: existingService.id },
          data: {
            name: providerService.name.trim(),
            platform,
            category,
            description,
            min,
            max,
            refill,
            providerRate,
            markupPercent,
            autoSync,
            ...(autoSync
              ? { rate: customerRate }
              : {}),
          },
        });

      return NextResponse.json({
        success: true,
        created: false,
        updated: true,
        message: "VIPSMM service updated successfully.",
        service: {
          ...service,
          rate: service.rate.toString(),
        },
      });
    }

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
          refill,
          providerId,
          providerName: "VIPSMM",
          providerRate,
          markupPercent,
          autoSync,
        },
      });

    return NextResponse.json({
      success: true,
      created: true,
      updated: false,
      message: "VIPSMM service imported successfully.",
      service: {
        ...service,
        rate: service.rate.toString(),
      },
    });
  } catch (error) {
    console.error("VIPSMM service import error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import VIPSMM service.",
      },
      { status: 500 }
    );
  }
}
