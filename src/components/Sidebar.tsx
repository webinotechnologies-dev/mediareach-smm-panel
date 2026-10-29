"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Layers,
  ListOrdered,
  Sparkles,
  CreditCard,
  Code2,
  HeadphonesIcon,
  Flame,
  Zap,
  TrendingUp,
  ShieldAlert
} from "lucide-react";

const navItems = [
  {
    name: "New Order",
    href: "/new-order",
    icon: ShoppingCart,
    badge: "Popular",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    name: "Mass Order",
    href: "/mass-order",
    icon: Layers,
  },
  {
    name: "Order History",
    href: "/orders",
    icon: ListOrdered,
  },
  {
    name: "Services & Rates",
    href: "/services",
    icon: Sparkles,
  },
  {
    name: "Add Funds",
    href: "/add-funds",
    icon: CreditCard,
    badge: "Instant",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    name: "Reseller API",
    href: "/api-docs",
    icon: Code2,
  },
  {
    name: "Support Desk",
    href: "/tickets",
    icon: HeadphonesIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 flex flex-col gap-6">
        {/* Navigation Links */}
        <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 shadow-xl shadow-black/40">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Main Menu</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-indigo-400"}`} />
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

        {/* Live Provider Health Banner */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-2.5 border-emerald-500/20 bg-emerald-950/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400">All Systems Operational</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-speed server cluster active. Instant order processing & 0% drop rate guaranteed.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20 text-[11px] text-slate-400">
            <span>Avg. Start Time:</span>
            <span className="font-semibold text-emerald-300">~45 Seconds</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
