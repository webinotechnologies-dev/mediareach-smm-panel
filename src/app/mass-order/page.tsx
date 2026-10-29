import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import MassOrderClient from "./MassOrderClient";

export const dynamic = "force-dynamic";

export default async function MassOrderPage() {
  const services = await prisma.service.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      sellRate: true,
      minQuantity: true,
      maxQuantity: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AppLayout>
      <MassOrderClient services={services} />
    </AppLayout>
  );
}
