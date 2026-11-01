import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import ServicesClient from "./ServicesClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Digital Reach Services & Pricing - Instagram, YouTube, Telegram Growth",
  description:
    "Explore 70+ automated social growth and digital reach solutions: Instagram followers, YouTube views, Telegram community growth, Facebook engagement. Fast delivery & wholesale agency rates.",
  keywords: [
    "digital reach services india",
    "instagram growth agency",
    "youtube reach expansion india",
    "telegram channel marketing",
    "facebook engagement agency",
    "wholesale digital growth rates",
    "social media expansion agency",
    "mediareach services pricing",
  ],
  openGraph: {
    title: "Digital Reach Services & Pricing | MediaReach Digital",
    description:
      "Explore 70+ automated social growth solutions. Wholesale agency rates from ₹8/1000. Instagram, YouTube, Telegram, Facebook reach with instant automated delivery.",
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
