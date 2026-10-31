import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "SMM Services & Pricing - India's Cheapest Instagram, YouTube, Telegram Panel",
  description:
    "Browse 70+ affordable SMM services: Instagram followers, YouTube views, Telegram members, Facebook likes, Twitter followers. Wholesale rates from ₹8/1000. Instant delivery 24/7.",
  keywords: [
    "buy instagram followers india cheap",
    "youtube views india",
    "telegram members buy",
    "facebook likes cheap india",
    "smm panel services india",
    "instagram followers price",
    "social media growth services",
    "cheap smm services india",
  ],
  openGraph: {
    title: "SMM Services & Pricing | MediaReach - India's Cheapest SMM Panel",
    description:
      "Browse 70+ affordable SMM services. Wholesale rates from ₹8/1000. Instagram, YouTube, Telegram, Facebook services with instant delivery.",
    url: "https://mediareachdigital.com/services",
    type: "website",
  },
  alternates: {
    canonical: "https://mediareachdigital.com/services",
  },
};

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
    <AppLayout requireAuth={false}>
      <ServicesClient initialCategories={categories} />
    </AppLayout>
  );
}
