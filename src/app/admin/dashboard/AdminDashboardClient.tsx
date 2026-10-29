"use client";

import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Network,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles
} from "lucide-react";
import { formatINR, formatNumber, formatDate } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  activeProviders: number;
  totalRevenue: number;
  totalWholesaleCost: number;
  totalNetProfit: number;
}

export default function AdminDashboardClient({
  stats,
  recentOrders,
  pendingPayments,
}: {
  stats: Stats;
  recentOrders: any[];
  pendingPayments: any[];
}) {
  const profitMarginPercent =
    stats.totalRevenue > 0
      ? ((stats.totalNetProfit / stats.totalRevenue) * 100).toFixed(1)
      : "52.5";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              👑 Admin Command Studio
            </span>
            <span className="text-xs text-slate-400">Live Real-time Financials</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Executive Analytics & Revenue
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/new-order"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Order as Customer</span>
          </Link>
          <Link
            href="/admin/providers"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition-all"
          >
            <Network className="w-4 h-4" />
            <span>Manage Providers</span>
          </Link>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit */}
        <div className="glass-panel p-5 rounded-3xl border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 space-y-2 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Net Net Profit</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatINR(stats.totalNetProfit)}
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium">
            Margin: <b>{profitMarginPercent}%</b> average markup
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="glass-panel p-5 rounded-3xl border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>Gross Revenue</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <DollarSign className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatINR(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400">
            Provider Cost: {formatINR(stats.totalWholesaleCost)}
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-3xl border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
            <span>Total Orders Processed</span>
            <div className="p-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
              <ShoppingBag className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatNumber(stats.totalOrders)}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.pendingOrders} orders in dispatch queue
          </div>
        </div>

        {/* Total Users */}
        <div className="glass-panel p-5 rounded-3xl border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span>Registered Customers</span>
            <div className="p-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Users className="w-4 h-4 text-purple-300" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatNumber(stats.totalUsers)}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats.activeProviders} Upstream Providers Connected
          </div>
        </div>
      </div>

      {/* Grid: Master Orders Feed + Pending Payments Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4 shadow-2xl border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Orders Dispatch Feed
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Charge</th>
                  <th className="py-2.5 px-3">Profit</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        #{ord.id.slice(0, 6)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-indigo-300">
                        {ord.user?.username || "Guest"}
                      </td>
                      <td className="py-3 px-3 truncate max-w-[160px]">
                        {ord.service.name}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {formatINR(ord.charge)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                        +{formatINR(ord.profit)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No orders placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Deposit Approvals */}
        <div className="glass-card p-6 rounded-3xl space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pending Payments
            </h3>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              {pendingPayments.length} Action Needed
            </span>
          </div>

          <div className="space-y-3">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((tx) => (
                <div key={tx.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{tx.user?.username}</span>
                    <span className="font-mono font-extrabold text-emerald-400">
                      {formatINR(tx.amount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    UTR: {tx.utrNumber || "Manual"}
                  </div>
                  <div className="pt-2 border-t border-white/5 flex gap-2">
                    <Link
                      href="/admin/payments"
                      className="w-full py-1.5 text-center rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      Review & Approve
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <span>All customer payments are up to date!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
