import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Login required." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session expired." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const apiUrl =
      process.env.MICOSMM_API_URL ||
      "https://micosmm.com/api/v2";

    const apiKey = process.env.MICOSMM_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "MICOSMM_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = new URLSearchParams({
      key: apiKey,
      action: "balance",
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `MicoSMM returned HTTP ${response.status}.`,
        },
        { status: 502 }
      );
    }

    if (data.error) {
      return NextResponse.json(
        {
          success: false,
          error: data.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "MicoSMM connection is working.",
      balance: data.balance ?? null,
      currency: data.currency ?? null,
    });
  } catch (error) {
    console.error("MicoSMM connection test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not connect to MicoSMM.",
      },
      { status: 500 }
    );
  }
}