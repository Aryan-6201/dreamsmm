import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const deletedOrders = await prisma.order.deleteMany({});
  const deletedServices = await prisma.service.deleteMany({});
  const deletedCategories = await prisma.category.deleteMany({});

  return NextResponse.json({
    deletedOrders: deletedOrders.count,
    deletedServices: deletedServices.count,
    deletedCategories: deletedCategories.count,
    message: "Orders, services and categories deleted."
  });
}
