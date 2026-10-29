import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, category, orderId, message, priority } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        subject: subject.trim(),
        category: category || "ORDER",
        orderId: orderId ? orderId.trim() : null,
        priority: priority || "NORMAL",
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            senderRole: user.role,
            message: message.trim(),
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error("Ticket Create Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
