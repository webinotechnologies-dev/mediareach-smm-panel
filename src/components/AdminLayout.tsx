import Navbar from "./Navbar";
import AdminSidebar from "./AdminSidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/new-order");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060913]">
      <Navbar initialUser={user} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex gap-8">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
