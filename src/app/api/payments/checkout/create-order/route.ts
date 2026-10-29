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

    const body = await req.json();
    const { amount } = body;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return NextResponse.json({ error: "Minimum deposit is ₹10" }, { status: 400 });
    }

    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const pgProvider = (settingsMap["pgProvider"] || "CASHFREE").toUpperCase();
    const pgKeyId = settingsMap["pgKeyId"] || "";
    const pgSecretKey = settingsMap["pgSecretKey"] || "";
    const pgMode = (settingsMap["pgMode"] || "SANDBOX").toUpperCase();
    const siteName = settingsMap["siteName"] || "MediaReach";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 1. CASHFREE PAYMENT GATEWAY
    if (pgProvider === "CASHFREE" && pgKeyId && pgSecretKey) {
      const cfBaseUrl =
        pgMode === "PROD" || pgMode === "PRODUCTION"
          ? "https://api.cashfree.com/pg"
          : "https://sandbox.cashfree.com/pg";

      const cfRes = await fetch(`${cfBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": pgKeyId,
          "x-client-secret": pgSecretKey,
          "x-api-version": "2023-08-01",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: parsedAmount,
          order_currency: "INR",
          customer_details: {
            customer_id: user.id,
            customer_name: user.username || "Customer",
            customer_email: user.email || "support@mediareachsmm.com",
            customer_phone: "9876543210",
          },
          order_meta: {
            return_url: `${appUrl}/add-funds?cf_order_id={order_id}`,
          },
          order_note: `MediaReach Wallet Deposit: ₹${parsedAmount}`,
        }),
      });

      const cfData = await cfRes.json();
      if (cfRes.ok && cfData.payment_session_id) {
        return NextResponse.json({
          success: true,
          provider: "CASHFREE",
          paymentSessionId: cfData.payment_session_id,
          orderId: cfData.order_id,
          amount: parsedAmount,
          currency: "INR",
          mode: pgMode === "PROD" || pgMode === "PRODUCTION" ? "production" : "sandbox",
          name: siteName,
        });
      } else {
        console.error("Cashfree order creation failed:", cfData);
      }
    }

    // 2. RAZORPAY PAYMENT GATEWAY
    if (pgProvider === "RAZORPAY" && pgKeyId && pgSecretKey) {
      const authHeader = "Basic " + Buffer.from(`${pgKeyId}:${pgSecretKey}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: Math.round(parsedAmount * 100), // in paise
          currency: "INR",
          receipt: orderId,
          notes: {
            userId: user.id,
            email: user.email,
          },
        }),
      });

      if (rzpRes.ok) {
        const rzpData = await rzpRes.json();
        return NextResponse.json({
          success: true,
          provider: "RAZORPAY",
          keyId: pgKeyId,
          orderId: rzpData.id,
          amount: parsedAmount,
          currency: "INR",
          name: siteName,
          description: "Wallet Balance Top-up",
          user: {
            name: user.username,
            email: user.email,
          },
        });
      }
    }

    // 3. Fallback: Direct 1-Click UPI Intent Checkout
    const upiId = settingsMap["upiId"] || "shubhambhati3187@upi";
    const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      siteName
    )}&am=${parsedAmount}&cu=INR&tn=${encodeURIComponent(orderId)}`;

    return NextResponse.json({
      success: true,
      provider: "UPI_INTENT",
      orderId: orderId,
      amount: parsedAmount,
      upiIntentUrl: upiIntentUrl,
      upiId: upiId,
      message: "Direct 1-Click UPI Payment Ready",
    });
  } catch (error: any) {
    console.error("Create checkout order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
