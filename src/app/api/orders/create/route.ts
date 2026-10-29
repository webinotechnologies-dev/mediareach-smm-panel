import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmmEngine } from "@/lib/smm-engine";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, link, quantity, comments, runs, interval } = body;

    if (!serviceId || !link || !quantity) {
      return NextResponse.json(
        { error: "Service, link, and quantity are required" },
        { status: 400 }
      );
    }

    const parsedQty = parseInt(quantity, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    // Fetch Service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service || service.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Selected service is currently inactive or unavailable" },
        { status: 400 }
      );
    }

    if (parsedQty < service.minQuantity || parsedQty > service.maxQuantity) {
      return NextResponse.json(
        {
          error: `Quantity must be between ${service.minQuantity.toLocaleString()} and ${service.maxQuantity.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    // Calculate charge
    const baseCharge = (service.sellRate * parsedQty) / 1000;
    // Apply user custom discount if any
    const discountAmount = user.customDiscountPercent > 0 ? (baseCharge * user.customDiscountPercent) / 100 : 0;
    const finalCharge = Math.max(0.01, baseCharge - discountAmount);

    const wholesaleCost = (service.wholesaleRate * parsedQty) / 1000;
    const profit = finalCharge - wholesaleCost;

    // Check user balance
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { balance: true },
    });

    if (!freshUser || freshUser.balance < finalCharge) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ₹${finalCharge.toFixed(2)}, Available: ₹${(freshUser?.balance || 0).toFixed(2)}. Please add funds.`,
        },
        { status: 400 }
      );
    }

    // ACID Transaction: Deduct Balance & Create Order & Record Transaction
    const [updatedUser, newOrder] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { balance: { decrement: finalCharge } },
      }),
      prisma.order.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          link: link.trim(),
          quantity: parsedQty,
          charge: finalCharge,
          wholesaleCost,
          profit,
          status: "PENDING",
          runs: runs ? parseInt(runs, 10) : 1,
          interval: interval ? parseInt(interval, 10) : 0,
          comments: comments || null,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: "ORDER_DEBIT",
          amount: finalCharge,
          balanceAfter: freshUser.balance - finalCharge,
          method: "UPI_QR",
          status: "APPROVED",
          notes: `Order for ${service.name} (Qty: ${parsedQty})`,
        },
      }),
    ]);

    // Dispatch to Provider asynchronously
    const dispatchResult = await SmmEngine.dispatchOrder(newOrder.id);

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        charge: finalCharge,
        balanceRemaining: updatedUser.balance,
        status: dispatchResult.success ? "IN_PROGRESS" : "PENDING",
        providerOrderId: dispatchResult.providerOrderId || null,
        message: dispatchResult.message,
      },
    });
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}
