import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const pgKeyId = settingsMap["pgKeyId"] || "";
    const pgSecretKey = settingsMap["pgSecretKey"] || "";
    const pgMode = (settingsMap["pgMode"] || "SANDBOX").toUpperCase();

    const cfBaseUrl =
      pgMode === "PROD" || pgMode === "PRODUCTION"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";

    // Call Cashfree to check order status
    const cfRes = await fetch(`${cfBaseUrl}/orders/${orderId}`, {
      headers: {
        "x-client-id": pgKeyId,
        "x-client-secret": pgSecretKey,
        "x-api-version": "2023-08-01",
      },
    });

    if (!cfRes.ok) {
      const errData = await cfRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || "Unable to fetch Cashfree order status" },
        { status: 400 }
      );
    }

    const orderData = await cfRes.json();
    const isPaid = orderData.order_status === "PAID";
    const amountINR = parseFloat(orderData.order_amount) || 0;

    if (isPaid && amountINR > 0) {
      const existing = await prisma.transaction.findFirst({
        where: { utrNumber: orderId },
      });

      if (!existing) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { balance: { increment: amountINR } },
          }),
          prisma.transaction.create({
            data: {
              userId: user.id,
              type: "DEPOSIT",
              amount: amountINR,
              balanceAfter: user.balance + amountINR,
              method: "CASHFREE_AUTO",
              status: "APPROVED",
              utrNumber: orderId,
              notes: `Cashfree Auto Checkout (Order: ${orderId})`,
            },
          }),
        ]);
      }

      return NextResponse.json({
        success: true,
        status: "PAID",
        amount: amountINR,
        message: `₹${amountINR} successfully credited to your wallet!`,
      });
    }

    return NextResponse.json({
      success: false,
      status: orderData.order_status,
      message: `Order status: ${orderData.order_status}`,
    });
  } catch (error: any) {
    console.error("Cashfree verify order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify order" },
      { status: 500 }
    );
  }
}

