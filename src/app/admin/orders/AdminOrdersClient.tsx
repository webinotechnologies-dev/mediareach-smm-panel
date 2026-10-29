"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  ExternalLink,
  RotateCcw,
  RotateCw,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send
} from "lucide-react";
import { formatINR, formatNumber, formatDate } from "@/lib/utils";

export default function AdminOrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        ord.link.toLowerCase().includes(q) ||
        ord.user?.username?.toLowerCase().includes(q) ||
        ord.service?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleAction = async (action: "CHANGE_STATUS" | "REFUND" | "RESEND", orderId: string, newStatus?: string) => {
    setLoadingId(orderId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, orderId, newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order action failed");

      setMessage({ text: `✅ ${data.message || "Action executed successfully!"}`, type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Master Order Command Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed, provider routing logs, status overrides, and instant refund triggers
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, user, or link..."
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Service & Provider</th>
                <th className="py-3 px-4">Link</th>
                <th className="py-3 px-4">Charge / Cost</th>
                <th className="py-3 px-4">Profit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                      #{ord.id.slice(0, 6)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-300">
                      {ord.user?.username || "Guest"}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{ord.service.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Provider: {ord.service.provider?.name || "Mock"} (P-ID: {ord.providerOrderId || "N/A"})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[140px] truncate">
                      <a
                        href={ord.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 truncate block"
                      >
                        {ord.link}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-emerald-400">{formatINR(ord.charge)}</div>
                      <div className="text-[10px] text-slate-400">Cost: {formatINR(ord.wholesaleCost)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      +{formatINR(ord.profit)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleAction("CHANGE_STATUS", ord.id, e.target.value)}
                        className="glass-input px-2 py-1 rounded-lg text-[11px] font-bold text-slate-200"
                      >
                        <option value="PENDING" className="bg-slate-900">PENDING</option>
                        <option value="IN_PROGRESS" className="bg-slate-900">IN_PROGRESS</option>
                        <option value="COMPLETED" className="bg-slate-900">COMPLETED</option>
                        <option value="PARTIAL" className="bg-slate-900">PARTIAL</option>
                        <option value="CANCELED" className="bg-slate-900">CANCELED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleAction("RESEND", ord.id)}
                        disabled={loadingId === ord.id}
                        title="Resend to Provider"
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction("REFUND", ord.id)}
                        disabled={loadingId === ord.id || ord.status === "CANCELED"}
                        title="Cancel & Full Refund to Wallet"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 disabled:opacity-30"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
