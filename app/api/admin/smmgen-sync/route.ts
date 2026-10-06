import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSmmGenServices } from "@/lib/providers/smmgen";

export async function GET(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");

    if (secret && auth !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    if (services.length === 0) {
      return NextResponse.json({
        success: true,
        checked: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        failures: [],
        message: "No SMMGen services require syncing.",
      });
    }

    // Fetch the complete SMMGen service list only ONCE.
    const providerServices = await getSmmGenServices();

    const providerMap = new Map(
      providerServices.map((service) => [
        String(service.service).trim(),
        service,
      ])
    );

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    const failures: Array<{
      id: string | number;
      providerId: string;
      reason: string;
    }> = [];

    for (const service of services) {
      const providerId = String(service.providerId).trim();

      try {
        if (!providerId) {
          skipped++;
          continue;
        }

        const provider = providerMap.get(providerId);

        if (!provider) {
          failed++;

          failures.push({
            id: service.id,
            providerId,
            reason: `SMMGen service ${providerId} was not found.`,
          });

          console.error(
            `SMMGen sync failed for #${service.id}: service ${providerId} was not found.`
          );

          continue;
        }

        const usdRate = Number(provider.rate);

        if (!Number.isFinite(usdRate) || usdRate < 0) {
          failed++;

          failures.push({
            id: service.id,
            providerId,
            reason: `Invalid provider rate: ${provider.rate}`,
          });

          console.error(
            `SMMGen sync failed for #${service.id}: invalid rate ${provider.rate}`
          );

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
          where: {
            id: service.id,
          },
          data: {
            providerRate,
            rate: sellingRate,
          },
        });

        updated++;
      } catch (error) {
        failed++;

        const reason =
          error instanceof Error
            ? error.message
            : "Unknown error";

        failures.push({
          id: service.id,
          providerId,
          reason,
        });

        console.error(
          `SMMGen sync failed for #${service.id}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      checked: services.length,
      updated,
      skipped,
      failed,
      failures,
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