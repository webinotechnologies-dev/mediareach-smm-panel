import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminPaymentsClient from "./AdminPaymentsClient";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, email: true, balance: true } },
    },
  });

  return (
    <AdminLayout>
      <AdminPaymentsClient initialTransactions={transactions} />
    </AdminLayout>
  );
}
