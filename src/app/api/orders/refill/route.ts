import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmmEngine } from "@/lib/smm-engine";

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          include: { provider: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
    }

    if (!order.service.refillSupported) {
      return NextResponse.json({ error: "This service does not support automatic refill" }, { status: 400 });
    }

    const provider = order.service.provider;
    const apiUrl = provider?.apiUrl || "MOCK_PROVIDER";
    const apiKey = provider?.apiKey || "mock_key";

    if (order.providerOrderId) {
      const refillRes = await SmmEngine.sendRequest(apiUrl, apiKey, {
        action: "refill",
        order: order.providerOrderId,
      });

      if (refillRes.error) {
        return NextResponse.json({ error: refillRes.error }, { status: 400 });
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { refillStatus: "REQUESTED" },
    });

    return NextResponse.json({
      success: true,
      message: "Refill request submitted successfully. Provider is reviewing delivery.",
    });
  } catch (error: any) {
    console.error("Refill Error:", error);
    return NextResponse.json({ error: error.message || "Refill failed" }, { status: 500 });
  }
}
