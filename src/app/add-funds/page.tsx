import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddFundsClient from "./AddFundsClient";

export const dynamic = "force-dynamic";

export default async function AddFundsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, type: { in: ["DEPOSIT", "ADMIN_ADJUSTMENT", "REFUND_CREDIT"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AppLayout>
      <AddFundsClient user={user} initialTransactions={transactions} />
    </AppLayout>
  );
}
