import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketsClient from "./TicketsClient";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        include: {
          senderUser: {
            select: { username: true, role: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <AppLayout>
      <TicketsClient initialTickets={tickets} userRole={user.role} />
    </AppLayout>
  );
}
