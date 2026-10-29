import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminServicesClient from "./AdminServicesClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const categories = await prisma.category.findMany({
    include: {
      services: {
        include: { provider: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const providers = await prisma.provider.findMany({
    select: { id: true, name: true },
  });

  return (
    <AdminLayout>
      <AdminServicesClient initialCategories={categories} providers={providers} />
    </AdminLayout>
  );
}
