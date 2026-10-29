import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { transactionId, action } = await req.json();

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    if (action === "APPROVE") {
      const [updatedUser, updatedTx] = await prisma.$transaction([
        prisma.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: transaction.amount } },
        }),
        prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "APPROVED",
            balanceAfter: transaction.user.balance + transaction.amount,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Payment of ₹${transaction.amount} approved and credited!`,
        transaction: updatedTx,
      });
    }

    if (action === "REJECT") {
      const updatedTx = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Deposit rejected",
        transaction: updatedTx,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Payment approval action failed" }, { status: 500 });
  }
}
