import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import ApiDocsClient from "./ApiDocsClient";

export const dynamic = "force-dynamic";

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
