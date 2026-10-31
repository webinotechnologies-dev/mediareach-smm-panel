import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import ApiDocsClient from "./ApiDocsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reseller API Documentation - SMM Panel API v2 Integration",
  description:
    "Full REST API documentation for MediaReach SMM panel resellers. Standard SMM panel API v2 compatible. Integrate Instagram, YouTube, Telegram services via API. Get your API key instantly.",
  keywords: [
    "smm panel api",
    "reseller api india",
    "smm api v2",
    "social media api integration",
    "mediareach api",
    "smm reseller panel api",
  ],
  openGraph: {
    title: "Reseller API Documentation | MediaReach SMM Panel API v2",
    description:
      "Full API documentation for MediaReach reseller panel. Integrate SMM services via REST API. Standard SMM panel API v2 compatible.",
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
