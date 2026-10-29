import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to add funds." }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, utrNumber, notes } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return NextResponse.json(
        { error: "Minimum deposit amount is ₹10" },
        { status: 400 }
      );
    }

    const cleanUtr = (utrNumber || "").trim().replace(/[^a-zA-Z0-9]/g, "");

    if (!cleanUtr || cleanUtr.length < 8) {
      return NextResponse.json(
        { error: "Please enter a valid 12-digit UPI Transaction ID (UTR / Reference No)." },
        { status: 400 }
      );
    }

    // 1. Check for Duplicate UTR to prevent fraud
    const existingTx = await prisma.transaction.findFirst({
      where: { utrNumber: cleanUtr },
    });

    if (existingTx) {
      return NextResponse.json(
        { error: "This Transaction ID (UTR) has already been submitted or credited. Duplicate entries are not allowed." },
        { status: 400 }
      );
    }

    // 2. Process Instant Auto Verification
    const isAutoApproved = method === "UPI_QR" || method === "PAYTM" || method === "CRYPTO_USDT";

    if (isAutoApproved) {
      const [updatedUser, transaction] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { increment: parsedAmount } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "DEPOSIT",
            amount: parsedAmount,
            balanceAfter: user.balance + parsedAmount,
            method: method || "UPI_QR",
            status: "APPROVED",
            utrNumber: cleanUtr,
            notes: notes || `UPI Auto Deposit (UTR: ${cleanUtr})`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `🎉 ₹${parsedAmount.toFixed(2)} added to your wallet instantly!`,
        balance: updatedUser.balance,
        transaction,
      });
    } else {
      // Manual Bank Transfer Approval
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: parsedAmount,
          balanceAfter: user.balance,
          method: method || "MANUAL_BANK",
          status: "PENDING",
          utrNumber: cleanUtr,
          notes: notes || "Manual Bank IMPS pending verification",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Deposit request submitted! Admin will verify and credit your balance within 15 minutes.",
        transaction,
      });
    }
  } catch (error: any) {
    console.error("Deposit API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process deposit" },
      { status: 500 }
    );
  }
}
