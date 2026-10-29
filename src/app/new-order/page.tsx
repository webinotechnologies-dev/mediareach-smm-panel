import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import NewOrderClient from "./NewOrderClient";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    include: {
      services: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      user: { select: { username: true } },
    },
  });

  return (
    <AppLayout>
      <NewOrderClient initialCategories={categories} recentOrders={recentOrders} />
    </AppLayout>
  );
}
