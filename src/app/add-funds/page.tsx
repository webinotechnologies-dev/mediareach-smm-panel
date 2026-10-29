import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AddFundsClient from "./AddFundsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AddFundsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [transactions, settings] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, type: { in: ["DEPOSIT", "ADMIN_ADJUSTMENT", "REFUND_CREDIT"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.systemSetting.findMany({
      where: { key: { in: ["upiId", "siteName", "minDeposit", "whatsappSupport"] } },
    }),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }

  const configuredUpiId = settingsMap["upiId"] || "shubhambhati3187@upi";
  const configuredSiteName = settingsMap["siteName"] || "MediaReach";
  const configuredMinDeposit = parseInt(settingsMap["minDeposit"] || "10", 10);
  const whatsappSupport = settingsMap["whatsappSupport"] || "";

  return (
    <AppLayout>
      <AddFundsClient
        user={user}
        initialTransactions={transactions}
        upiId={configuredUpiId}
        siteName={configuredSiteName}
        minDeposit={configuredMinDeposit}
        whatsappSupport={whatsappSupport}
      />
    </AppLayout>
  );
}
