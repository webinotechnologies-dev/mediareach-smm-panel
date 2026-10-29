import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { id, name, categoryId, sellRate, wholesaleRate, minQuantity, maxQuantity, status, speedBadge, guaranteeBadge } = body;

    if (id) {
      // Update existing
      const updated = await prisma.service.update({
        where: { id },
        data: {
          name,
          categoryId,
          sellRate: parseFloat(sellRate),
          wholesaleRate: parseFloat(wholesaleRate),
          minQuantity: parseInt(minQuantity),
          maxQuantity: parseInt(maxQuantity),
          status,
          speedBadge,
          guaranteeBadge,
        },
      });
      return NextResponse.json({ success: true, service: updated });
    } else {
      // Create new
      const created = await prisma.service.create({
        data: {
          name,
          categoryId,
          sellRate: parseFloat(sellRate),
          wholesaleRate: parseFloat(wholesaleRate),
          minQuantity: parseInt(minQuantity),
          maxQuantity: parseInt(maxQuantity),
          status: status || "ACTIVE",
          speedBadge: speedBadge || "⚡ Instant",
          guaranteeBadge: guaranteeBadge || "🛡️ 30-Day Refill",
          qualityRating: 99,
        },
      });
      return NextResponse.json({ success: true, service: created });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save service" }, { status: 500 });
  }
}
