import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmmEngine } from "@/lib/smm-engine";

export async function POST(req: Request) {
  try {
    let params: Record<string, any> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      params = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        params[key] = value;
      });
    }

    const { key, action } = params;

    if (!key) {
      return NextResponse.json({ error: "API key is missing" }, { status: 400 });
    }

    // Authenticate user via API key
    const user = await prisma.user.findFirst({
      where: { apiKey: key, isBanned: false },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Action: balance
    if (action === "balance") {
      return NextResponse.json({
        balance: user.balance.toFixed(2),
        currency: "INR",
      });
    }

    // Action: services
    if (action === "services") {
      const services = await prisma.service.findMany({
        where: { status: "ACTIVE" },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      });

      const formatted = services.map((s) => ({
        service: s.id,
        name: s.name,
        type: s.type || "Default",
        category: s.category.name,
        rate: s.sellRate.toFixed(2),
        min: String(s.minQuantity),
        max: String(s.maxQuantity),
        refill: s.refillSupported,
        cancel: s.cancelSupported,
      }));

      return NextResponse.json(formatted);
    }

    // Action: add
    if (action === "add") {
      const { service: serviceId, link, quantity, comments, runs, interval } = params;

      if (!serviceId || !link || !quantity) {
        return NextResponse.json({ error: "Missing required parameters (service, link, quantity)" }, { status: 400 });
      }

      const parsedQty = parseInt(quantity, 10);
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { provider: true },
      });

      if (!service || service.status !== "ACTIVE") {
        return NextResponse.json({ error: "Service not found or disabled" }, { status: 400 });
      }

      if (parsedQty < service.minQuantity || parsedQty > service.maxQuantity) {
        return NextResponse.json({ error: `Quantity must be between ${service.minQuantity} and ${service.maxQuantity}` }, { status: 400 });
      }

      const charge = (service.sellRate * parsedQty) / 1000;
      if (user.balance < charge) {
        return NextResponse.json({ error: "Not enough funds on balance" }, { status: 400 });
      }

      const [updatedUser, newOrder] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: charge } },
        }),
        prisma.order.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            link: String(link).trim(),
            quantity: parsedQty,
            charge,
            wholesaleCost: (service.wholesaleRate * parsedQty) / 1000,
            profit: charge - (service.wholesaleRate * parsedQty) / 1000,
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
            amount: charge,
            balanceAfter: user.balance - charge,
            method: "UPI_QR",
            status: "APPROVED",
            notes: `Reseller API Order for ${service.name}`,
          },
        }),
      ]);

      await SmmEngine.dispatchOrder(newOrder.id);

      return NextResponse.json({ order: newOrder.id });
    }

    // Action: status
    if (action === "status") {
      if (params.order) {
        const order = await prisma.order.findFirst({
          where: { id: String(params.order), userId: user.id },
        });

        if (!order) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json({
          charge: order.charge.toFixed(2),
          start_count: String(order.startCount),
          status: order.status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
          remains: String(order.remains),
          currency: "INR",
        });
      }

      if (params.orders) {
        const orderIds = String(params.orders).split(",").map((s) => s.trim());
        const orders = await prisma.order.findMany({
          where: { id: { in: orderIds }, userId: user.id },
        });

        const result: Record<string, any> = {};
        for (const ord of orders) {
          result[ord.id] = {
            charge: ord.charge.toFixed(2),
            start_count: String(ord.startCount),
            status: ord.status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
            remains: String(ord.remains),
            currency: "INR",
          };
        }

        return NextResponse.json(result);
      }

      return NextResponse.json({ error: "Missing order parameter" }, { status: 400 });
    }

    // Action: refill
    if (action === "refill") {
      const order = await prisma.order.findFirst({
        where: { id: String(params.order), userId: user.id },
      });

      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      await prisma.order.update({
        where: { id: order.id },
        data: { refillStatus: "REQUESTED" },
      });

      return NextResponse.json({ refill: "1" });
    }

    return NextResponse.json({ error: "Incorrect request action" }, { status: 400 });
  } catch (error: any) {
    console.error("Reseller API v2 error:", error);
    return NextResponse.json({ error: "Internal API Server Error" }, { status: 500 });
  }
}
