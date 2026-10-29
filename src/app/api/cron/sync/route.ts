import { NextResponse } from "next/server";
import { SmmEngine } from "@/lib/smm-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await SmmEngine.syncActiveOrders();
    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.updatedCount} active orders (${result.refundedCount} auto-refunded).`,
      updatedCount: result.updatedCount,
      refundedCount: result.refundedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Order Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync provider orders" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
