import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

import { verifySession } from "@/lib/auth";
import { addMicoSmmOrder } from "@/lib/providers/micosmm";
import { addMkapiOrder } from "@/lib/providers/mkapi";

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
              name: { contains: string; mode: "insensitive" };
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
 * Creates an order, sends it to MicoSMM,
 * stores the provider order ID,
 * and refunds the customer if the provider rejects the order.
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
      typeof body.link === "string" ? body.link.trim() : "";

    if (
      !Number.isInteger(serviceId) ||
      serviceId <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !link
    ) {
      return NextResponse.json(
        { error: "Service, link and valid quantity are required." },
        { status: 400 }
      );
    }

    if (link.length > 2048) {
      return NextResponse.json(
        { error: "Target link is too long." },
        { status: 400 }
      );
    }

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

    if (quantity < service.min || quantity > service.max) {
      return NextResponse.json(
        {
          error: `Quantity must be between ${service.min} and ${service.max}.`,
        },
        { status: 400 }
      );
    }

    if (!service.providerId) {
      return NextResponse.json(
        { error: "This service is not connected to a provider yet." },
        { status: 400 }
      );
    }

    const baseCharge = service.rate.mul(quantity).div(1000);

    const userForDiscount = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        discountPercent: true,
      },
    });

    const discountPercent = userForDiscount?.discountPercent ?? 0;

    const discountPercentValue = Number(discountPercent);

    if (
      !Number.isFinite(discountPercentValue) ||
      discountPercentValue < 0 ||
      discountPercentValue > 100
    ) {
      throw new Error("INVALID_USER_DISCOUNT");
    }

    const discountAmount = baseCharge
      .mul(discountPercentValue)
      .div(100);

    const charge = baseCharge.sub(discountAmount);

    if (charge.lte(0)) {
      return NextResponse.json(
        { error: "Invalid service price." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const balanceUpdate = await tx.user.updateMany({
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
        const user = await tx.user.findUnique({
          where: {
            id: session.userId,
          },
          select: {
            status: true,
          },
        });

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("ACCOUNT_NOT_ACTIVE");
        }

        throw new Error("INSUFFICIENT_BALANCE");
      }

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

      await tx.transaction.create({
        data: {
          userId: session.userId,
          type: "ORDER",
          amount: charge,
          note: `Order #${order.id} - ${service.name}`,
        },
      });

      const updatedUser = await tx.user.findUnique({
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
    });

    let providerOrderId: string;

    try {
      let providerResult;

      if (service.providerName === "MKAPI") {
        providerResult = await addMkapiOrder({
          serviceId: service.providerId,
          link,
          quantity,
        });
      } else {
        providerResult = await addMicoSmmOrder({
          serviceId: service.providerId,
          link,
          quantity,
        });
      }

      providerOrderId = providerResult.providerOrderId;
    } catch (providerError) {
      console.error("MicoSMM order error:", providerError);

      await prisma.$transaction(async (tx) => {
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
            note: `Refund for failed MicoSMM order #${result.order.id}`,
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
      });

      return NextResponse.json(
        {
          error:
            providerError instanceof Error
              ? providerError.message
              : "MicoSMM rejected the order. Your balance has been refunded.",
        },
        { status: 502 }
      );
    }

    const finalOrder = await prisma.order.update({
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
          { error: "User account not found." },
          { status: 404 }
        );
      }

      if (error.message === "ACCOUNT_NOT_ACTIVE") {
        return NextResponse.json(
          { error: "Your account is not active." },
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
    }

    console.error("Order creation error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while processing your request.",
      },
      { status: 500 }
    );
  }
}






