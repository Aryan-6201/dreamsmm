import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMkapiService } from "@/lib/providers/mkapi";

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

function getPlatform(name: string, category?: string, type?: string) {
  const value = `${name} ${category || ""} ${type || ""}`.toLowerCase();

  if (value.includes("instagram")) return "Instagram";
  if (value.includes("youtube")) return "YouTube";
  if (value.includes("facebook")) return "Facebook";
  if (value.includes("tiktok")) return "TikTok";
  if (value.includes("telegram")) return "Telegram";
  if (value.includes("spotify")) return "Spotify";
  if (value.includes("reddit")) return "Reddit";
  if (value.includes("twitter") || value.includes(" x ")) return "X";

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

    const action = body.action === "import" ? "import" : "fetch";
    const serviceId = String(body.serviceId || "").trim();

    if (!serviceId) {
      return NextResponse.json(
        { error: "MKAPI service ID is required." },
        { status: 400 }
      );
    }

    const provider = await getMkapiService(serviceId);

    const service = {
      service: String(provider.service),
      name: provider.name,
      type: provider.type || "",
      category: provider.category || "",
      description: provider.description || "",
      rate: String(provider.rate),
      min: Number(provider.min),
      max: Number(provider.max),
      refill:
        provider.refill === true ||
        provider.refill === "true",
      cancel:
        provider.cancel === true ||
        provider.cancel === "true",
      average_time:
        provider.average_time ?? null,
    };

    if (action === "fetch") {
      return NextResponse.json({
        success: true,
        service,
      });
    }

    const markupPercent = Number(body.markupPercent);

    if (!Number.isFinite(markupPercent) || markupPercent < 0) {
      return NextResponse.json(
        { error: "Markup must be 0 or greater." },
        { status: 400 }
      );
    }

    const providerRate = Number(service.rate);

    if (!Number.isFinite(providerRate) || providerRate < 0) {
      return NextResponse.json(
        { error: "MKAPI returned an invalid rate." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(service.min) ||
      !Number.isInteger(service.max) ||
      service.min <= 0 ||
      service.max < service.min
    ) {
      return NextResponse.json(
        { error: "MKAPI returned invalid service limits." },
        { status: 400 }
      );
    }

    const sellingRate =
      providerRate * (1 + markupPercent / 100);

    const providerId = service.service;

    const existing = await prisma.service.findFirst({
      where: {
        providerName: "MKAPI",
        providerId,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            `MKAPI service ${providerId} is already imported ` +
            `as service #${existing.id}.`,
        },
        { status: 409 }
      );
    }

    const category =
      service.category ||
      service.type ||
      getPlatform(service.name, service.category, service.type);

    const created = await prisma.service.create({
      data: {
        name: service.name,
        platform: getPlatform(
          service.name,
          service.category,
          service.type
        ),
        category: category || null,
        description: service.description || null,
        rate: sellingRate,
        min: service.min,
        max: service.max,
        enabled: true,
        refill: service.refill,
        providerId,
        providerName: "MKAPI",
        providerRate,
        markupPercent,
        autoSync: Boolean(body.autoSync),
      },
    });

    return NextResponse.json({
      success: true,
      service: {
        id: created.id,
        name: created.name,
        providerId: created.providerId,
        providerName: created.providerName,
        providerRate:
          created.providerRate?.toString() ?? null,
        markupPercent:
          created.markupPercent?.toString() ?? null,
        rate: created.rate.toString(),
        autoSync: created.autoSync,
      },
    });
  } catch (error) {
    console.error("MKAPI IMPORT ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import MKAPI service.",
      },
      { status: 500 }
    );
  }
}
