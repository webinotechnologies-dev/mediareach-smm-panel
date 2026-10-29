import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate real stats
  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
  const activeProviders = await prisma.provider.count({ where: { status: "ACTIVE" } });

  const orders = await prisma.order.findMany({
    select: { charge: true, wholesaleCost: true, profit: true },
  });

  const totalRevenue = orders.reduce((acc, o) => acc + o.charge, 0);
  const totalWholesaleCost = orders.reduce((acc, o) => acc + o.wholesaleCost, 0);
  const totalNetProfit = orders.reduce((acc, o) => acc + o.profit, 0);

  const recentOrders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      user: { select: { username: true } },
    },
  });

  const pendingPayments = await prisma.transaction.findMany({
    where: { status: "PENDING", type: "DEPOSIT" },
    take: 5,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminLayout>
      <AdminDashboardClient
        stats={{
          totalUsers,
          totalOrders,
          pendingOrders,
          activeProviders,
          totalRevenue,
          totalWholesaleCost,
          totalNetProfit,
        }}
        recentOrders={recentOrders}
        pendingPayments={pendingPayments}
      />
    </AdminLayout>
  );
}
