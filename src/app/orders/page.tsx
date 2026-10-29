import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersClient from "./OrdersClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      service: {
        include: { category: true },
      },
    },
  });

  return (
    <AppLayout>
      <OrdersClient initialOrders={orders} />
    </AppLayout>
  );
}
