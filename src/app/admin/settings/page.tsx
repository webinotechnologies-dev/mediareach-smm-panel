import AdminLayout from "@/components/AdminLayout";
import { prisma } from "@/lib/prisma";
import AdminSettingsClient from "./AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  return (
    <AdminLayout>
      <AdminSettingsClient />
    </AdminLayout>
  );
}
