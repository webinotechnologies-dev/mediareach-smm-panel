import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminProvidersClient from "./AdminProvidersClient";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  const providers = await prisma.provider.findMany({
    include: {
      _count: { select: { services: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AdminLayout>
      <AdminProvidersClient initialProviders={providers} />
    </AdminLayout>
  );
}
