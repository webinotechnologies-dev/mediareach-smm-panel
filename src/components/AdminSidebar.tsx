"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  Sliders,
  DollarSign,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

const adminNavItems = [
  {
    name: "Analytics & Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Multi-Providers Hub",
    href: "/admin/providers",
    icon: Network,
    badge: "Active",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    name: "Services & Margins",
    href: "/admin/services",
    icon: Layers,
  },
  {
    name: "Order Command Desk",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Users & Wallets",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Payment Approvals",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "System Settings",
    href: "/admin/settings",
    icon: Sliders,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 flex flex-col gap-6">
        {/* Navigation Links */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 border-amber-500/20 shadow-xl shadow-black/40">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Studio</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
              ROOT
            </span>
          </div>

          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-amber-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Profit Margin Tip */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-2.5 border-indigo-500/20 bg-indigo-950/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">Profit Protection Mode</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Auto-Margin Lock is actively synchronizing with upstream providers. Minimum 45% net margin secured.
          </p>
        </div>
      </div>
    </aside>
  );
}
