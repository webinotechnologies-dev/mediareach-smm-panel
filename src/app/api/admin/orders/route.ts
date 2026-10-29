import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmmEngine } from "@/lib/smm-engine";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { action, orderId, newStatus } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Action: Change Status
    if (action === "CHANGE_STATUS") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });
      return NextResponse.json({ success: true, message: `Status updated to ${newStatus}` });
    }

    // Action: Auto-Refund & Cancel
    if (action === "REFUND") {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: order.userId },
          data: { balance: { increment: order.charge } },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELED",
            errorReason: `Refunded by Admin (₹${order.charge.toFixed(2)})`,
          },
        }),
        prisma.transaction.create({
          data: {
            userId: order.userId,
            type: "REFUND_CREDIT",
            amount: order.charge,
            balanceAfter: order.user.balance + order.charge,
            method: "ADMIN_GIFT",
            status: "APPROVED",
            notes: `Manual Admin Refund for Order #${order.id}`,
          },
        }),
      ]);
      return NextResponse.json({ success: true, message: `Order refunded and canceled successfully` });
    }

    // Action: Resend to Provider
    if (action === "RESEND") {
      const result = await SmmEngine.dispatchOrder(order.id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Order action failed" }, { status: 500 });
  }
}
