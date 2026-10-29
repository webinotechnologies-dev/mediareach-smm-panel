import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { action, targetUserId, amount, discountPercent, isBanned } = await req.json();

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (action === "ADJUST_BALANCE") {
      const parsedAmount = parseFloat(amount);
      const newBalance = targetUser.balance + parsedAmount;

      const [updated] = await prisma.$transaction([
        prisma.user.update({
          where: { id: targetUser.id },
          data: { balance: newBalance },
        }),
        prisma.transaction.create({
          data: {
            userId: targetUser.id,
            type: "ADMIN_ADJUSTMENT",
            amount: Math.abs(parsedAmount),
            balanceAfter: newBalance,
            method: "ADMIN_GIFT",
            status: "APPROVED",
            notes: `Admin manual balance adjustment (${parsedAmount >= 0 ? "+" : ""}${parsedAmount})`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "TOGGLE_BAN") {
      const updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: { isBanned: Boolean(isBanned) },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === "SET_DISCOUNT") {
      const updated = await prisma.user.update({
        where: { id: targetUser.id },
        data: { customDiscountPercent: parseFloat(discountPercent) || 0.0 },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
