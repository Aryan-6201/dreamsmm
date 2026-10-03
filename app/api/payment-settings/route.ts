import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  payment_upi_id: "aryan251@ybl",
  payment_name: "Aryan",
  payment_qr: "/qr.jpeg",
  payment_description: "Scan the QR code using any UPI app and complete your payment. After payment, enter the exact UTR / Transaction ID below and submit your deposit request.",
};

export async function GET() {
  try {
    const settings = await prisma.panelSetting.findMany({
      where: {
        key: {
          in: Object.keys(DEFAULTS),
        },
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
    console.error("Get public payment settings error:", error);

    return NextResponse.json({
      settings: DEFAULTS,
    });
  }
}
