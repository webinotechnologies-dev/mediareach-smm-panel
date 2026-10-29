import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SmmEngine } from "@/lib/smm-engine";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { providerId, marginPercent } = await req.json();
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

    const marginMultiplier = 1 + (parseFloat(marginPercent) || 40) / 100;

    const services = await SmmEngine.sendRequest(provider.apiUrl, provider.apiKey, {
      action: "services",
    });

    if (!Array.isArray(services)) {
      return NextResponse.json(
        { error: services?.error || "Provider did not return a valid services array" },
        { status: 400 }
      );
    }

    let importedCount = 0;

    for (const item of services) {
      const categoryName = item.category || "General Services";
      const wholesaleRate = parseFloat(item.rate) || 10.0;
      const sellRate = wholesaleRate * marginMultiplier;

      // Find or create category
      let category = await prisma.category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            platform: categoryName.toUpperCase().includes("INSTAGRAM")
              ? "INSTAGRAM"
              : categoryName.toUpperCase().includes("YOUTUBE")
              ? "YOUTUBE"
              : categoryName.toUpperCase().includes("TELEGRAM")
              ? "TELEGRAM"
              : categoryName.toUpperCase().includes("FACEBOOK")
              ? "FACEBOOK"
              : "OTHER",
            sortOrder: 10,
          },
        });
      }

      // Create Service
      await prisma.service.create({
        data: {
          name: item.name,
          categoryId: category.id,
          providerId: provider.id,
          providerServiceId: String(item.service),
          wholesaleRate,
          sellRate: Math.ceil(sellRate * 100) / 100,
          minQuantity: parseInt(item.min) || 10,
          maxQuantity: parseInt(item.max) || 100000,
          speedBadge: "⚡ Auto Speed",
          guaranteeBadge: item.refill ? "🛡️ Auto Refill" : "🛡️ Guaranteed",
          qualityRating: 98,
          description: `Auto-imported service ID #${item.service} with ${marginPercent}% profit margin lock.`,
          refillSupported: Boolean(item.refill),
          cancelSupported: Boolean(item.cancel),
          status: "ACTIVE",
        },
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} services with +${marginPercent}% profit margin!`,
      importedCount,
    });
  } catch (error: any) {
    console.error("Service Import Error:", error);
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}
