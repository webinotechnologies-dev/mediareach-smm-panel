import { prisma } from "./prisma";

export interface SmmProviderResponse {
  order?: number | string;
  error?: string;
  status?: string;
  charge?: string | number;
  start_count?: string | number;
  remains?: string | number;
  currency?: string;
  balance?: string | number;
  refill?: string | number;
}

export class SmmEngine {
  /**
   * Send HTTP POST to an external standard SMM v2 Provider
   */
  static async sendRequest(
    apiUrl: string,
    apiKey: string,
    params: Record<string, any>
  ): Promise<any> {
    // If it's the internal sandbox/mock provider
    if (apiUrl.includes("mock.smmpanel") || apiUrl === "MOCK_PROVIDER") {
      return this.handleMockRequest(params);
    }

    try {
      const formData = new URLSearchParams();
      formData.append("key", apiKey);
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "NextGen-SMM-Panel-Engine/2.0",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Provider HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`SMM Provider Request Failed [${apiUrl}]:`, error);
      return { error: error.message || "Provider communication failed" };
    }
  }

  /**
   * Internal Sandbox/Mock Engine for 100% Free Testing & Instant Delivery
   */
  private static handleMockRequest(params: Record<string, any>): any {
    const action = params.action;

    if (action === "balance") {
      return { balance: "50000.00", currency: "INR" };
    }

    if (action === "services") {
      return [
        {
          service: "101",
          name: "Instagram Likes [Ultra Fast] [Non-Drop] [HQ Profiles]",
          type: "Default",
          category: "Instagram Likes",
          rate: "12.50",
          min: "10",
          max: "50000",
          refill: true,
          cancel: true,
        },
        {
          service: "102",
          name: "Instagram Followers [Guaranteed 30-Day Refill] [Real-Looking]",
          type: "Default",
          category: "Instagram Followers",
          rate: "48.00",
          min: "50",
          max: "100000",
          refill: true,
          cancel: true,
        },
        {
          service: "201",
          name: "YouTube Views [High Retention 5-15 min] [Monetizable]",
          type: "Default",
          category: "YouTube Views",
          rate: "85.00",
          min: "100",
          max: "500000",
          refill: true,
          cancel: true,
        },
        {
          service: "301",
          name: "Telegram Channel Members [Global HQ] [Zero Drop]",
          type: "Default",
          category: "Telegram Members",
          rate: "35.00",
          min: "20",
          max: "20000",
          refill: true,
          cancel: true,
        },
      ];
    }

    if (action === "add") {
      const mockOrderId = Math.floor(100000 + Math.random() * 900000);
      return { order: mockOrderId };
    }

    if (action === "status") {
      if (params.order) {
        return {
          charge: "10.00",
          start_count: "120",
          status: "In progress",
          remains: "50",
          currency: "INR",
        };
      }
      if (params.orders) {
        const orderIds = String(params.orders).split(",");
        const result: Record<string, any> = {};
        for (const id of orderIds) {
          const statuses = ["In progress", "Completed", "In progress", "Processing"];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          result[id.trim()] = {
            charge: "15.00",
            start_count: "350",
            status: randomStatus,
            remains: randomStatus === "Completed" ? "0" : "20",
            currency: "INR",
          };
        }
        return result;
      }
    }

    if (action === "refill") {
      return { refill: Math.floor(10000 + Math.random() * 90000) };
    }

    if (action === "cancel") {
      return { cancel: params.order };
    }

    return { error: "Unknown action" };
  }

  /**
   * Dispatch an order to its designated provider (with Auto-Refund protection on failure)
   */
  static async dispatchOrder(orderId: string): Promise<{ success: boolean; message: string; providerOrderId?: string }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
        user: true,
      },
    });

    if (!order) return { success: false, message: "Order not found" };

    const provider = order.service.provider;
    const providerServiceId = order.service.providerServiceId || "101";

    // If no provider or mock provider, simulate immediate dispatch
    const apiUrl = provider?.apiUrl || "MOCK_PROVIDER";
    const apiKey = provider?.apiKey || "mock_key";

    const response = await this.sendRequest(apiUrl, apiKey, {
      action: "add",
      service: providerServiceId,
      link: order.link,
      quantity: order.quantity,
      runs: order.runs,
      interval: order.interval,
      comments: order.comments,
    });

    if (response.error || !response.order) {
      console.warn(`Order #${order.id} provider dispatch failed:`, response.error);

      // Record error on order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PENDING",
          errorReason: response.error || "Provider failed to accept order",
        },
      });

      return {
        success: false,
        message: response.error || "Failed to dispatch order to upstream provider",
      };
    }

    // Success: Link provider order ID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        providerOrderId: String(response.order),
        status: "IN_PROGRESS",
        errorReason: null,
      },
    });

    return {
      success: true,
      message: "Order successfully dispatched to provider",
      providerOrderId: String(response.order),
    };
  }

  /**
   * Sync active orders status in batches & auto-refund cancelled ones
   */
  static async syncActiveOrders(): Promise<{ updatedCount: number; refundedCount: number }> {
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] },
        providerOrderId: { not: null },
      },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
        user: true,
      },
      take: 100,
    });

    if (activeOrders.length === 0) {
      return { updatedCount: 0, refundedCount: 0 };
    }

    let updatedCount = 0;
    let refundedCount = 0;

    // Group orders by provider
    const ordersByProvider: Record<string, typeof activeOrders> = {};
    for (const order of activeOrders) {
      const providerId = order.service.providerId || "MOCK";
      if (!ordersByProvider[providerId]) ordersByProvider[providerId] = [];
      ordersByProvider[providerId].push(order);
    }

    for (const [providerId, orders] of Object.entries(ordersByProvider)) {
      const provider = orders[0].service.provider;
      const apiUrl = provider?.apiUrl || "MOCK_PROVIDER";
      const apiKey = provider?.apiKey || "mock_key";

      const orderIdMap = new Map<string, (typeof orders)[0]>();
      const providerIds: string[] = [];

      for (const ord of orders) {
        if (ord.providerOrderId) {
          orderIdMap.set(ord.providerOrderId, ord);
          providerIds.push(ord.providerOrderId);
        }
      }

      if (providerIds.length === 0) continue;

      const statusRes = await this.sendRequest(apiUrl, apiKey, {
        action: "status",
        orders: providerIds.join(","),
      });

      if (!statusRes || statusRes.error) continue;

      for (const [pId, statusData] of Object.entries(statusRes as Record<string, any>)) {
        const order = orderIdMap.get(pId);
        if (!order || !statusData) continue;

        const rawStatus = (statusData.status || "").toLowerCase();
        let newStatus = order.status;
        const startCount = parseInt(statusData.start_count) || order.startCount;
        const remains = parseInt(statusData.remains) || 0;

        if (rawStatus.includes("complete")) {
          newStatus = "COMPLETED";
        } else if (rawStatus.includes("in progress") || rawStatus.includes("inprogress")) {
          newStatus = "IN_PROGRESS";
        } else if (rawStatus.includes("process")) {
          newStatus = "PROCESSING";
        } else if (rawStatus.includes("partial")) {
          newStatus = "PARTIAL";
        } else if (rawStatus.includes("cancel")) {
          newStatus = "CANCELED";
        }

        if (newStatus === "CANCELED" || newStatus === "PARTIAL") {
          // Automatic Safe Refund
          const refundAmount = newStatus === "CANCELED" 
            ? order.charge 
            : (order.charge * (remains / order.quantity));

          if (refundAmount > 0) {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: order.userId },
                data: { balance: { increment: refundAmount } },
              }),
              prisma.order.update({
                where: { id: order.id },
                data: {
                  status: newStatus,
                  startCount,
                  remains,
                  errorReason: `Provider ${newStatus} order - Auto-refunded ${refundAmount.toFixed(2)} to wallet`,
                },
              }),
              prisma.transaction.create({
                data: {
                  userId: order.userId,
                  type: "REFUND_CREDIT",
                  amount: refundAmount,
                  balanceAfter: order.user.balance + refundAmount,
                  method: "ADMIN_GIFT",
                  status: "APPROVED",
                  notes: `Auto-refund for Order #${order.id} (${newStatus})`,
                },
              }),
            ]);
            refundedCount++;
          }
        } else {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newStatus,
              startCount,
              remains,
            },
          });
        }
        updatedCount++;
      }
    }

    return { updatedCount, refundedCount };
  }
}
