import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

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

const DEFAULTS = {
  payment_upi_id: "aryan251@ybl",
  payment_name: "Aryan",
  payment_qr: "/qr.jpeg",
  payment_description: "Scan the QR code using any UPI app and complete your payment. After payment, enter the exact UTR / Transaction ID below and submit your deposit request.",
};

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const keys = Object.keys(DEFAULTS);

    const settings = await prisma.panelSetting.findMany({
      where: {
        key: { in: keys },
      },
    });

    const result = { ...DEFAULTS };

    for (const setting of settings) {
      if (setting.key in result) {
        result[setting.key as keyof typeof result] = setting.value;
      }
    }

    return NextResponse.json({
      settings: result,
    });
  } catch (error) {
    console.error("Get payment settings error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const paymentUpiId = String(body.payment_upi_id ?? "").trim();
    const paymentName = String(body.payment_name ?? "").trim();
    const paymentQr = String(body.payment_qr ?? "").trim();
    const paymentDescription = String(body.payment_description ?? "").trim();

    if (!paymentUpiId) {
      return NextResponse.json(
        { error: "UPI ID is required" },
        { status: 400 }
      );
    }

    if (!paymentName) {
      return NextResponse.json(
        { error: "Payment name is required" },
        { status: 400 }
      );
    }

    if (!paymentQr) {
      return NextResponse.json(
        { error: "QR image is required" },
        { status: 400 }
      );
    }

    if (!paymentDescription) {
      return NextResponse.json(
        { error: "Payment description is required" },
        { status: 400 }
      );
    }

    const settings = [
      {
        key: "payment_upi_id",
        value: paymentUpiId,
        description: "UPI ID shown on the funds page",
      },
      {
        key: "payment_name",
        value: paymentName,
        description: "Payment account/name shown on the funds page",
      },
      {
        key: "payment_qr",
        value: paymentQr,
        description: "QR image URL shown on the funds page",
      },
      {
        key: "payment_description",
        value: paymentDescription,
        description: "Payment instructions shown below the QR code on the funds page",
      },
    ];

    await prisma.$transaction(
      settings.map((setting) =>
        prisma.panelSetting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            description: setting.description,
          },
          create: setting,
        })
      )
    );

    return NextResponse.json({
      success: true,
      settings: {
        payment_upi_id: paymentUpiId,
        payment_name: paymentName,
        payment_qr: paymentQr,
        payment_description: paymentDescription,
      },
    });
  } catch (error) {
    console.error("Update payment settings error:", error);

    return NextResponse.json(
      { error: "Could not update payment settings" },
      { status: 500 }
    );
  }
}
