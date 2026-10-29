import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import ApiDocsClient from "./ApiDocsClient";

export const dynamic = "force-dynamic";

export default async function ApiDocsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <AppLayout>
      <ApiDocsClient apiKey={user.apiKey || "smm_live_usr_demo_key_7781"} />
    </AppLayout>
  );
}
