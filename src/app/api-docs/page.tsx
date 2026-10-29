import AppLayout from "@/components/AppLayout";
import { getCurrentUser } from "@/lib/auth";
import ApiDocsClient from "./ApiDocsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ApiDocsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <ApiDocsClient apiKey={user.apiKey || "smm_live_usr_demo_key_7781"} />
    </AppLayout>
  );
}
