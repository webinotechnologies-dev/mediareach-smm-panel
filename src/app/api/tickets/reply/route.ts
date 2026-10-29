import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ticketId, message } = await req.json();
    if (!ticketId || !message) {
      return NextResponse.json({ error: "Ticket ID and message are required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    if (ticket.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const newStatus = user.role === "ADMIN" ? "ANSWERED" : "USER_REPLIED";

    const [ticketMessage, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: user.id,
          senderRole: user.role,
          message: message.trim(),
        },
      }),
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: newStatus },
      }),
    ]);

    return NextResponse.json({ success: true, message: ticketMessage, ticket: updatedTicket });
  } catch (error: any) {
    console.error("Ticket Reply Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post reply" }, { status: 500 });
  }
}
