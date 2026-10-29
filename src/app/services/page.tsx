import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
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

  return (
    <AppLayout>
      <ServicesClient initialCategories={categories} />
    </AppLayout>
  );
}
