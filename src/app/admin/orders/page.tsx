import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { include: { provider: true } },
      user: { select: { id: true, username: true, email: true } },
    },
  });

  return (
    <AdminLayout>
      <AdminOrdersClient initialOrders={orders} />
    </AdminLayout>
  );
}
