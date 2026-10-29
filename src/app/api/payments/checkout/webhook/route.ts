import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const body = JSON.parse(rawBody || "{}");

    const settings = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => (settingsMap[s.key] = s.value));

    const pgSecretKey = settingsMap["pgSecretKey"] || "";

    // 1. CASHFREE WEBHOOK (type: "PAYMENT_SUCCESS_WEBHOOK")
    if (body.type === "PAYMENT_SUCCESS_WEBHOOK" || body.data?.payment?.payment_status === "SUCCESS") {
      const data = body.data || {};
      const order = data.order || {};
      const payment = data.payment || {};
      const customer = data.customer_details || {};

      const orderId = order.order_id;
      const amountINR = parseFloat(payment.payment_amount || order.order_amount) || 0;
      const userId = customer.customer_id;
      const txnId = payment.cf_payment_id ? String(payment.cf_payment_id) : orderId;

      if (userId && amountINR > 0) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          const existing = await prisma.transaction.findFirst({
            where: {
              OR: [{ utrNumber: String(txnId) }, { utrNumber: String(orderId) }],
            },
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
                  utrNumber: String(txnId),
                  notes: `Cashfree Instant Webhook (Order: ${orderId}, Ref: ${payment.bank_reference || ""})`,
                },
              }),
            ]);
            console.log(`[Cashfree Webhook] Credited ₹${amountINR} to User ${user.username}`);
          }
        }
      }

      return NextResponse.json({ status: "OK", message: "Cashfree payment processed" });
    }

    // 2. RAZORPAY WEBHOOK
    const razorpaySignature = headers.get("x-razorpay-signature");
    if (razorpaySignature && pgSecretKey) {
      const expectedSignature = crypto
        .createHmac("sha256", pgSecretKey)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature === razorpaySignature) {
        const event = body.event;
        if (event === "payment.captured" || event === "order.paid") {
          const payment = body.payload?.payment?.entity;
          const amountINR = (payment?.amount || 0) / 100;
          const notes = payment?.notes || {};
          const userId = notes.userId;
          const txnId = payment?.id;

          if (userId && amountINR > 0) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
              const existing = await prisma.transaction.findFirst({
                where: { utrNumber: txnId },
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
                      method: "GATEWAY_1CLICK",
                      status: "APPROVED",
                      utrNumber: txnId,
                      notes: `1-Click Auto Checkout (Rzp: ${txnId})`,
                    },
                  }),
                ]);
              }
            }
          }
        }
        return NextResponse.json({ status: "OK", message: "Razorpay payment processed" });
      }
    }

    // 3. GENERIC UPI / YOUPI-PG WEBHOOK
    if (body.utr || body.transactionId || body.client_txn_id) {
      const utr = body.utr || body.transactionId || body.bank_ref_num;
      const status = (body.status || "").toUpperCase();
      const amount = parseFloat(body.amount) || 0;
      const userId = body.customer_id || body.userId;

      if ((status === "SUCCESS" || status === "COMPLETED") && amount > 0 && userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          const existing = await prisma.transaction.findFirst({
            where: { utrNumber: String(utr) },
          });

          if (!existing) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: user.id },
                data: { balance: { increment: amount } },
              }),
              prisma.transaction.create({
                data: {
                  userId: user.id,
                  type: "DEPOSIT",
                  amount: amount,
                  balanceAfter: user.balance + amount,
                  method: "UPI_AUTO_WEBHOOK",
                  status: "APPROVED",
                  utrNumber: String(utr),
                  notes: `Auto UPI Webhook Verified: ₹${amount}`,
                },
              }),
            ]);
          }
        }
      }
      return NextResponse.json({ status: "OK", message: "UPI webhook processed" });
    }

    return NextResponse.json({ status: "IGNORED", message: "No actionable event matched" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook error" },
      { status: 500 }
    );
  }
}
