import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getMicoSmmService } from "@/lib/providers/micosmm";

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

function getPlatform(service: {
  name?: string;
  category?: string;
  type?: string;
}) {
  const value =
    `${service.name || ""} ${service.category || ""} ${
      service.type || ""
    }`.toLowerCase();

  if (value.includes("instagram")) return "Instagram";
  if (value.includes("youtube")) return "YouTube";
  if (value.includes("facebook")) return "Facebook";
  if (value.includes("tiktok")) return "TikTok";
  if (value.includes("telegram")) return "Telegram";
  if (value.includes("spotify")) return "Spotify";
  if (value.includes("reddit")) return "Reddit";
  if (value.includes("twitter") || value.includes(" x "))
    return "X";

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

    const body = await request.json();

    const action =
      body.action === "import" ? "import" : "fetch";

    const serviceId = String(body.serviceId || "").trim();

    if (!serviceId) {
      return NextResponse.json(
        { error: "MicoSMM service ID is required." },
        { status: 400 }
      );
    }

    // Fetch service from MicoSMM
    const provider = await getMicoSmmService(serviceId);

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
    };

    // Fetch only
    if (action === "fetch") {
      return NextResponse.json({
        success: true,
        service,
      });
    }

    // -------------------------
    // IMPORT SERVICE
    // -------------------------

    const markupPercent = Number(body.markupPercent);

    if (
      !Number.isFinite(markupPercent) ||
      markupPercent < 0
    ) {
      return NextResponse.json(
        {
          error: "Markup must be 0 or greater.",
        },
        { status: 400 }
      );
    }

    const providerRate = Number(service.rate);

    if (
      !Number.isFinite(providerRate) ||
      providerRate < 0
    ) {
      return NextResponse.json(
        {
          error: "MicoSMM returned an invalid rate.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(service.min) ||
      !Number.isInteger(service.max)
    ) {
      return NextResponse.json(
        {
          error: "MicoSMM returned invalid service limits.",
        },
        { status: 400 }
      );
    }

    // Your editable markup
    const sellingRate =
      providerRate *
      (1 + markupPercent / 100);

    // Prevent duplicate imports
    const existing =
      await prisma.service.findFirst({
        where: {
          providerName: "MicoSMM",
          providerId: service.service,
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            `MicoSMM service ${service.service} ` +
            `is already imported as service #${existing.id}.`,
        },
        { status: 409 }
      );
    }

    const created =
      await prisma.service.create({
        data: {
          name: service.name,
          platform: getPlatform(service),

          category:
            service.category ||
            service.type ||
            null,

          description:
            service.description || null,

          rate: sellingRate,

          min: service.min,
          max: service.max,

          enabled: true,
          refill: service.refill,

          providerId: service.service,
          providerName: "MicoSMM",

          providerRate: providerRate,
          markupPercent: markupPercent,

          autoSync: Boolean(body.autoSync),
        },
      });

    return NextResponse.json({
      success: true,

      service: {
        id: created.id,
        name: created.name,
        providerId: created.providerId,

        providerRate:
          created.providerRate?.toString() ?? null,

        markupPercent:
          created.markupPercent?.toString() ?? null,

        rate: created.rate.toString(),

        autoSync: created.autoSync,
      },
    });
  } catch (error) {
    console.error(
      "MicoSMM IMPORT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import MicoSMM service.",
      },
      { status: 500 }
    );
  }
}
