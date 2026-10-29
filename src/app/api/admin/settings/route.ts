import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settingsRecords = await prisma.systemSetting.findMany();
    const settingsMap: Record<string, string> = {
      siteName: "MediaReach",
      currency: "INR",
      minDeposit: "10",
      announcement: "⚡ Welcome to MediaReach! India's #1 Automated Digital Growth Engine with instant delivery & 0% drop protection.",
      autoMarginPercent: "50",
      upiId: "shubhambhati3187@upi",
      whatsappSupport: "+91",
      autoUpiApiKey: "",
      autoUpiEndpoint: "https://api.ekqr.in/api/v1",
      pgProvider: "RAZORPAY", // RAZORPAY | CASHFREE | PHONEPE
      pgKeyId: "",
      pgSecretKey: "",
    };

    for (const item of settingsRecords) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteName,
      currency,
      minDeposit,
      announcement,
      autoMarginPercent,
      upiId,
      whatsappSupport,
      autoUpiApiKey,
      autoUpiEndpoint,
      pgProvider,
      pgKeyId,
      pgSecretKey,
    } = body;

    const updates = [
      { key: "siteName", value: String(siteName || "MediaReach") },
      { key: "currency", value: String(currency || "INR") },
      { key: "minDeposit", value: String(minDeposit || "10") },
      { key: "announcement", value: String(announcement || "") },
      { key: "autoMarginPercent", value: String(autoMarginPercent || "50") },
      { key: "upiId", value: String(upiId || "shubhambhati3187@upi") },
      { key: "whatsappSupport", value: String(whatsappSupport || "") },
      { key: "autoUpiApiKey", value: String(autoUpiApiKey || "") },
      { key: "autoUpiEndpoint", value: String(autoUpiEndpoint || "") },
      { key: "pgProvider", value: String(pgProvider || "RAZORPAY") },
      { key: "pgKeyId", value: String(pgKeyId || "") },
      { key: "pgSecretKey", value: String(pgSecretKey || "") },
    ];

    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({
      success: true,
      message: "System & Payment Gateway settings saved successfully!",
    });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
