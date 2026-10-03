import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const popupId = Number(body.popupId);
    const type = body.type;

    if (!Number.isInteger(popupId) || !["VIEW", "CLICK", "DISMISS"].includes(type)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    await prisma.popupEvent.create({
      data: {
        popupId,
        userId: session.userId,
        type,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POPUP EVENT ERROR:", error);
    return NextResponse.json({ error: "Could not record event" }, { status: 500 });
  }
}
