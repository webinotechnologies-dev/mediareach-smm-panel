import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import ApiDocsClient from "./ApiDocsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner & Developer API Documentation - Digital Reach Engine API v2",
  description:
    "Full REST API documentation for MediaReach Digital partners and agency developers. Standard REST API v2 compatible. Programmatically automate and scale digital reach campaigns.",
  keywords: [
    "digital reach api",
    "social growth developer api",
    "partner api integration",
    "marketing agency api v2",
    "mediareach digital api",
    "automated reach api",
  ],
  openGraph: {
    title: "Partner & Developer API Documentation | MediaReach Digital API v2",
    description:
      "Full API documentation for MediaReach Digital partners. Integrate digital reach and growth services via REST API. Fast, secure, and automated.",
    url: "https://mediareachdigital.com/api-docs",
    type: "website",
  },
  alternates: {
    canonical: "https://mediareachdigital.com/api-docs",
  },
};

export default async function ApiDocsPage() {
  const user = await getCurrentUser();

  return (
    <AppLayout requireAuth={false}>
      <ApiDocsClient
        apiKey={user?.apiKey || ""}
        isLoggedIn={Boolean(user)}
      />
    </AppLayout>
  );
}
