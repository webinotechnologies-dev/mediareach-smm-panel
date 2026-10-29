import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, apiUrl, apiKey, currency } = body;

    if (!name || !apiUrl || !apiKey) {
      return NextResponse.json({ error: "Name, API URL, and API Key are required" }, { status: 400 });
    }

    const provider = await prisma.provider.create({
      data: {
        name: name.trim(),
        apiUrl: apiUrl.trim(),
        apiKey: apiKey.trim(),
        currency: currency || "INR",
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, provider });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to add provider" }, { status: 500 });
  }
}
