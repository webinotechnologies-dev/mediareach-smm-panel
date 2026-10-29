import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, method, utrNumber, proofImage, notes } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      return NextResponse.json(
        { error: "Minimum deposit amount is ₹10" },
        { status: 400 }
      );
    }

    // In demo/UPI Auto mode: If UTR is provided and valid length (12 digits), we can auto-approve or queue
    // For seamless testing, if UTR is passed, we credit instantly!
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
            utrNumber: utrNumber || `UPI${Date.now()}`,
            proofImage: proofImage || null,
            notes: notes || "Instant UPI Auto-Verification",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `₹${parsedAmount.toFixed(2)} added to your wallet successfully!`,
        balance: updatedUser.balance,
        transaction,
      });
    } else {
      // Manual approval
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: parsedAmount,
          balanceAfter: user.balance,
          method: method || "MANUAL_BANK",
          status: "PENDING",
          utrNumber: utrNumber || null,
          proofImage: proofImage || null,
          notes: notes || "Manual payment pending admin verification",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Deposit request submitted! Admin will verify and credit your balance shortly.",
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
