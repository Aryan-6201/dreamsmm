import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "QR image is required" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "QR image must be smaller than 5 MB" },
        { status: 400 }
      );
    }

    const allowedTypes: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = allowedTypes[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Supported formats: JPG, PNG, WEBP" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "payment-qr"
    );

    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `qr-${crypto.randomBytes(8).toString("hex")}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const qrUrl = `/uploads/payment-qr/${fileName}`;

    await prisma.panelSetting.upsert({
      where: { key: "payment_qr" },
      update: {
        value: qrUrl,
        description: "QR image URL shown on the funds page",
      },
      create: {
        key: "payment_qr",
        value: qrUrl,
        description: "QR image URL shown on the funds page",
      },
    });

    return NextResponse.json({
      success: true,
      payment_qr: qrUrl,
    });
  } catch (error) {
    console.error("Payment QR upload error:", error);

    return NextResponse.json(
      { error: "Could not upload QR image" },
      { status: 500 }
    );
  }
}
