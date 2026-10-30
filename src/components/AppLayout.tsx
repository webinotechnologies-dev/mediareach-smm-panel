import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
  requireAuth = true,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user && requireAuth) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#060913]">
      <Navbar initialUser={user} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex gap-8">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
