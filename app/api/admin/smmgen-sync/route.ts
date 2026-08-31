import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSmmGenService } from "@/lib/providers/smmgen";

export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");

    if (secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: {
        providerName: "SMMGen",
        autoSync: true,
        providerId: { not: null },
      },
      select: {
        id: true,
        providerId: true,
        providerRate: true,
        markupPercent: true,
      },
    });

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const service of services) {
      try {
        if (!service.providerId) {
          skipped++;
          continue;
        }

        const provider = await getSmmGenService(
          String(service.providerId)
        );

        const usdRate = Number(provider.rate);

        if (!Number.isFinite(usdRate) || usdRate < 0) {
          failed++;
          continue;
        }

        const providerRate = Number(
          (usdRate * 95.426).toFixed(4)
        );

        const markup = Number(service.markupPercent ?? 0);

        const sellingRate = Number(
          (providerRate * (1 + markup / 100)).toFixed(4)
        );

        if (Number(service.providerRate ?? 0) === providerRate) {
          skipped++;
          continue;
        }

        await prisma.service.update({
          where: { id: service.id },
          data: {
            providerRate,
            rate: sellingRate,
          },
        });

        updated++;
      } catch (error) {
        console.error(
          `SMMGen sync failed for #${service.id}:`,
          error
        );
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: services.length,
      updated,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("SMMGen AUTO SYNC ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "SMMGen sync failed.",
      },
      { status: 500 }
    );
  }
}
