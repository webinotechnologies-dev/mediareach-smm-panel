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

    const { providerId } = await req.json();
    const provider = await prisma.provider.findUnique({ where: { id: providerId } });
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

    const res = await SmmEngine.sendRequest(provider.apiUrl, provider.apiKey, {
      action: "balance",
    });

    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    const newBalance = parseFloat(res.balance) || 0.0;
    await prisma.provider.update({
      where: { id: provider.id },
      data: { balance: newBalance, currency: res.currency || provider.currency },
    });

    return NextResponse.json({
      success: true,
      balance: newBalance,
      currency: res.currency || provider.currency,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Balance check failed" }, { status: 500 });
  }
}
