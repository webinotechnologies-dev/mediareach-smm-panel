import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, transactions: true } },
    },
  });

  return (
    <AdminLayout>
      <AdminUsersClient initialUsers={users} />
    </AdminLayout>
  );
}
