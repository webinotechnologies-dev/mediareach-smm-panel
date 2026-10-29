"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, UserCheck } from "lucide-react";

interface RoleToggleProps {
  currentRole: "USER" | "ADMIN";
}

export default function RoleToggle({ currentRole }: RoleToggleProps) {
  const pathname = usePathname();
  const [isPublicDomain, setIsPublicDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname.includes("mediareachdigital.com")) {
      setIsPublicDomain(true);
    }
  }, []);

  if (currentRole !== "ADMIN" || isPublicDomain) return null;

  const isAdminView = pathname.startsWith("/admin");

  return (
    <div className="flex items-center gap-2 bg-slate-900/90 border border-indigo-500/30 rounded-full p-1 shadow-lg shadow-indigo-500/10 backdrop-blur-md">
      <Link
        href="/new-order"
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          !isAdminView
            ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Customer View</span>
      </Link>

      <Link
        href="/admin/dashboard"
        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
          isAdminView
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25"
            : "text-slate-400 hover:text-amber-400"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Admin Studio</span>
      </Link>
    </div>
  );
}
