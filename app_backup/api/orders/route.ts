import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

import { verifySession } from "@/lib/auth";
import { addMicoSmmOrder } from "@/lib/providers/micosmm";
import { addSmmGenOrder } from "@/lib/providers/smmgen";
import { addMkapiOrder } from "@/lib/providers/mkapi";
import { addVipSmmOrder } from "@/lib/providers/vipsmm";

/**
 * GET /api/orders
 *
 * Returns only the currently logged-in user's orders.
 *
 * Supports:
 * ?page=1
 * ?limit=10
 * ?status=ALL|PENDING|PROCESSING|COMPLETED|PARTIAL|CANCELLED|REFUNDED
 * ?search=order-id-or-service-or-link
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const requestedPage = Number(searchParams.get("page") || "1");
    const requestedLimit = Number(searchParams.get("limit") || "10");

    const page = Number.isInteger(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(20, Math.max(5, requestedLimit))
      : 10;

    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    const validStatuses = [
      "ALL",
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "PARTIAL",
      "CANCELLED",
      "REFUNDED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status." },
        { status: 400 }
      );
    }

    const where: {
      userId: string;
      status?:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "PARTIAL"
        | "CANCELLED"
        | "REFUNDED";
      OR?: Array<
        | { id: number }
        | { link: { contains: string; mode: "insensitive" } }
        | {
            service: {
              name: {
                contains: string;
                mode: "insensitive";
              };
            };
          }
      >;
    } = {
      userId: session.userId,
    };

    if (status !== "ALL") {
      where.status = status as
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "PARTIAL"
        | "CANCELLED"
        | "REFUNDED";
    }

    if (search) {
      const numericId = Number(search);

      where.OR = [
        ...(Number.isInteger(numericId) && numericId > 0
          ? [{ id: numericId }]
          : []),
        {
          link: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          service: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          service: {
            select: {
              name: true,
              platform: true,
              category: true,
              refill: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        link: order.link,
        quantity: order.quantity,
        charge: order.charge.toString(),
        status: order.status,
        startCount: order.startCount,
        remains: order.remains,
        providerId: order.providerId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        service: order.service,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      { error: "Unable to load orders." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 *
 * Pricing priority:
 *
 * 1. User + Service specific discount
 * 2. User global discountPercent
 * 3. Normal service rate
 *
 * Specific service discount overrides global user discount.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json(
        { error: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const serviceId = Number(body.serviceId);
    const quantity = Number(body.quantity);

    const link =
      typeof body.link === "string"
        ? body.link.trim()
        : "";

    if (
      !Number.isInteger(serviceId) ||
      serviceId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !link
    ) {
      return NextResponse.json(
        {
          error:
            "Service, link and valid quantity are required.",
        },
        { status: 400 }
      );
    }

    if (link.length > 2048) {
      return NextResponse.json(
        { error: "Target link is too long." },
        { status: 400 }
      );
    }

    /**
     * Load service.
     */
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        enabled: true,
      },
      select: {
        id: true,
        name: true,
        rate: true,
        min: true,
        max: true,
        providerId: true,
        providerName: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "This service is not available." },
        { status: 404 }
      );
    }

    /**
     * Validate quantity.
     */
    if (quantity < service.min || quantity > service.max) {
      return NextResponse.json(
        {
          error: `Quantity must be between ${service.min} and ${service.max}.`,
        },
        { status: 400 }
      );
    }

    /**
     * Provider must exist.
     */
    if (!service.providerId) {
      return NextResponse.json(
        {
          error:
            "This service is not connected to a provider yet.",
        },
        { status: 400 }
      );
    }

    /**
     * Normal service charge.
     * Service rate = price per 1000 quantity.
     */
    const baseCharge = service.rate
      .mul(quantity)
      .div(1000);

    /**
     * Load user global discount.
     */
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        discountPercent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    /**
     * Find user + service specific discount.
     *
     * Only enabled and non-expired discounts
     * are considered active.
     */
    const now = new Date();

    const serviceDiscount =
      await prisma.userServiceDiscount.findFirst({
        where: {
          userId: session.userId,
          serviceId: service.id,
          enabled: true,
          OR: [
            {
              expiresAt: null,
            },
            {
              expiresAt: {
                gt: now,
              },
            },
          ],
        },
        select: {
          id: true,
          type: true,
          value: true,
          expiresAt: true,
        },
      });

    let discountAmount = baseCharge;
    let charge = baseCharge;

    /**
     * =====================================================
     * SPECIFIC USER + SERVICE DISCOUNT
     * =====================================================
     */
    if (serviceDiscount) {
      const discountValue = Number(serviceDiscount.value);

      if (
        !Number.isFinite(discountValue) ||
        discountValue < 0
      ) {
        throw new Error("INVALID_SERVICE_DISCOUNT");
      }

      /**
       * Percentage discount
       *
       * Example:
       * Base = ₹100
       * 20% = ₹20 discount
       * Customer pays ₹80
       */
      if (serviceDiscount.type === "PERCENTAGE") {
        if (discountValue > 100) {
          throw new Error("INVALID_SERVICE_DISCOUNT");
        }

        discountAmount = baseCharge
          .mul(discountValue)
          .div(100);

        charge = baseCharge.sub(discountAmount);
      }

      /**
       * Fixed discount
       *
       * Example:
       * Base = ₹100
       * Fixed = ₹10
       * Customer pays ₹90
       */
      else if (serviceDiscount.type === "FIXED") {
        // Fixed discount is an actual currency amount.
        // Example: base ₹100, value ₹10 => customer pays ₹90.
        const fixedDiscount = serviceDiscount.value;

        discountAmount = baseCharge.gte(fixedDiscount)
          ? fixedDiscount
          : baseCharge;

        charge = baseCharge.sub(discountAmount);
      }

      else {
        throw new Error("INVALID_SERVICE_DISCOUNT");
      }
    }

    /**
     * =====================================================
     * GLOBAL USER DISCOUNT
     * =====================================================
     *
     * Used only when there is no active
     * user + service discount.
     */
    else {
      const discountPercentValue = Number(
        user.discountPercent ?? 0
      );

      if (
        !Number.isFinite(discountPercentValue) ||
        discountPercentValue < 0 ||
        discountPercentValue > 100
      ) {
        throw new Error("INVALID_USER_DISCOUNT");
      }

      discountAmount = baseCharge
        .mul(discountPercentValue)
        .div(100);

      charge = baseCharge.sub(discountAmount);
    }

    /**
     * Never allow zero or negative charge.
     */
    if (charge.lte(0)) {
      return NextResponse.json(
        { error: "Invalid service price." },
        { status: 400 }
      );
    }

    /**
     * =====================================================
     * CREATE ORDER + DEDUCT BALANCE ATOMICALLY
     * =====================================================
     */
    const result = await prisma.$transaction(
      async (tx) => {
        const balanceUpdate =
          await tx.user.updateMany({
            where: {
              id: session.userId,
              status: "ACTIVE",
              balance: {
                gte: charge,
              },
            },
            data: {
              balance: {
                decrement: charge,
              },
              totalSpent: {
                increment: charge,
              },
            },
          });

        if (balanceUpdate.count !== 1) {
          const currentUser =
            await tx.user.findUnique({
              where: {
                id: session.userId,
              },
              select: {
                status: true,
              },
            });

          if (!currentUser) {
            throw new Error("USER_NOT_FOUND");
          }

          if (currentUser.status !== "ACTIVE") {
            throw new Error("ACCOUNT_NOT_ACTIVE");
          }

          throw new Error("INSUFFICIENT_BALANCE");
        }

        /**
         * Save FINAL discounted charge.
         */
        const order = await tx.order.create({
          data: {
            userId: session.userId,
            serviceId: service.id,
            link,
            quantity,
            charge,
            status: "PENDING",
          },
          select: {
            id: true,
            serviceId: true,
            quantity: true,
            charge: true,
            status: true,
            createdAt: true,
          },
        });

        /**
         * Save the actual amount paid.
         */
        await tx.transaction.create({
          data: {
            userId: session.userId,
            type: "ORDER",
            amount: charge,
            note: `Order #${order.id} - ${service.name}`,
          },
        });

        const updatedUser =
          await tx.user.findUnique({
            where: {
              id: session.userId,
            },
            select: {
              balance: true,
              totalSpent: true,
            },
          });

        if (!updatedUser) {
          throw new Error("USER_NOT_FOUND");
        }

        return {
          order,
          balance: updatedUser.balance,
          totalSpent: updatedUser.totalSpent,
        };
      }
    );

    /**
     * =====================================================
     * SEND ORDER TO PROVIDER
     * =====================================================
     */
    let providerOrderId: string;

    try {
      let providerResult;

      const providerName =
        service.providerName?.toUpperCase() || "";

      if (providerName === "SMMGEN") {
        providerResult = await addSmmGenOrder({
          serviceId: service.providerId!,
          link,
          quantity,
        });
      } else if (providerName === "MKAPI") {
        providerResult = await addMkapiOrder({
          serviceId: service.providerId!,
          link,
          quantity,
        });
      } else if (
        providerName.startsWith("VIPSMM")
      ) {
        providerResult = await addVipSmmOrder({
          serviceId: service.providerId!,
          link,
          quantity,
        });
      } else {
        providerResult = await addMicoSmmOrder({
          serviceId: service.providerId!,
          link,
          quantity,
        });
      }

      providerOrderId =
        providerResult.providerOrderId;
    } catch (providerError) {
      console.error(
        "Provider order error:",
        providerError
      );

      /**
       * ===================================================
       * PROVIDER FAILED → EXACT REFUND
       * ===================================================
       */
      await prisma.$transaction(
        async (tx) => {
          await tx.user.update({
            where: {
              id: session.userId,
            },
            data: {
              balance: {
                increment: result.order.charge,
              },
              totalSpent: {
                decrement: result.order.charge,
              },
            },
          });

          await tx.transaction.create({
            data: {
              userId: session.userId,
              type: "REFUND",
              amount: result.order.charge,
              note: `Refund for failed provider order #${result.order.id}`,
            },
          });

          await tx.order.update({
            where: {
              id: result.order.id,
            },
            data: {
              status: "REFUNDED",
            },
          });
        }
      );

      return NextResponse.json(
        {
          error:
            providerError instanceof Error
              ? providerError.message
              : "Provider rejected the order. Your balance has been refunded.",
        },
        { status: 502 }
      );
    }

    /**
     * =====================================================
     * PROVIDER SUCCESS
     * =====================================================
     */
    const finalOrder =
      await prisma.order.update({
        where: {
          id: result.order.id,
        },
        data: {
          providerId: providerOrderId,
          status: "PROCESSING",
        },
        select: {
          id: true,
          serviceId: true,
          quantity: true,
          charge: true,
          status: true,
          providerId: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: {
          id: finalOrder.id,
          serviceId: finalOrder.serviceId,
          quantity: finalOrder.quantity,
          charge: finalOrder.charge.toString(),
          status: finalOrder.status,
          providerId: finalOrder.providerId,
          createdAt: finalOrder.createdAt,
        },
        balance: result.balance.toString(),
        totalSpent: result.totalSpent.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          {
            error: "User account not found.",
          },
          { status: 404 }
        );
      }

      if (error.message === "ACCOUNT_NOT_ACTIVE") {
        return NextResponse.json(
          {
            error: "Your account is not active.",
          },
          { status: 403 }
        );
      }

      if (error.message === "INSUFFICIENT_BALANCE") {
        return NextResponse.json(
          {
            error:
              "Insufficient balance. Please add funds before placing this order.",
          },
          { status: 400 }
        );
      }

      if (error.message === "INVALID_USER_DISCOUNT") {
        return NextResponse.json(
          {
            error:
              "Invalid user discount configuration.",
          },
          { status: 500 }
        );
      }

      if (
        error.message === "INVALID_SERVICE_DISCOUNT"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid service discount configuration.",
          },
          { status: 500 }
        );
      }
    }

    console.error(
      "Order creation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request.",
      },
      { status: 500 }
    );
  }
}