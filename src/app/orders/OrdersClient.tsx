"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Filter,
  ListOrdered
} from "lucide-react";
import { formatINR, formatNumber, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  remains: number;
  status: string;
  refillStatus: string | null;
  errorReason: string | null;
  createdAt: string | Date;
  service: {
    name: string;
    refillSupported: boolean;
    category: {
      platform: string;
    };
  };
}

const statusTabs = [
  { id: "ALL", label: "All Orders" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "PENDING", label: "Pending" },
  { id: "PARTIAL", label: "Partial" },
  { id: "CANCELED", label: "Canceled & Refunded" },
];

export default function OrdersClient({ initialOrders }: { initialOrders: OrderItem[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refillingId, setRefillingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesTab = selectedTab === "ALL" || ord.status === selectedTab;
      const matchesSearch =
        searchQuery.trim() === "" ||
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.link.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.service.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orders, selectedTab, searchQuery]);

  const handleRefill = async (orderId: string) => {
    setRefillingId(orderId);
    setMessage(null);
    try {
      const res = await fetch("/api/orders/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refill request failed");

      setMessage({ text: "✅ Refill requested successfully!", type: "success" });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, refillStatus: "REQUESTED" } : o))
      );
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setRefillingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case "IN_PROGRESS":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>In Progress</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Partial (Refunded)</span>
          </span>
        );
      case "CANCELED":
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Canceled (Refunded)</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Order History & Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery stats, counters, and 1-click refill manager
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, link, or service..."
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

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTab === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Target Link</th>
                <th className="py-3.5 px-4">Charge / Qty</th>
                <th className="py-3.5 px-4">Start / Remains</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      #{ord.id.slice(0, 8)}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(ord.createdAt)}
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 font-medium max-w-[200px]">
                      <span className="truncate block font-semibold text-white">
                        {ord.service.name}
                      </span>
                    </td>

                    {/* Link */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <a
                        href={ord.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 truncate"
                      >
                        <span className="truncate">{ord.link}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </td>

                    {/* Charge / Qty */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400 font-mono">
                        {formatINR(ord.charge)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatNumber(ord.quantity)} units
                      </div>
                    </td>

                    {/* Start / Remains */}
                    <td className="py-3.5 px-4 font-mono">
                      <div>Start: {formatNumber(ord.startCount)}</div>
                      <div className="text-[11px] text-slate-400">
                        Remains: {formatNumber(ord.remains)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.status)}
                      {ord.errorReason && (
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={ord.errorReason}>
                          {ord.errorReason}
                        </p>
                      )}
                    </td>

                    {/* 1-Click Refill Action */}
                    <td className="py-3.5 px-4 text-right">
                      {ord.service.refillSupported && (ord.status === "COMPLETED" || ord.status === "PARTIAL") ? (
                        <button
                          onClick={() => handleRefill(ord.id)}
                          disabled={ord.refillStatus === "REQUESTED" || refillingId === ord.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            ord.refillStatus === "REQUESTED"
                              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                              : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:scale-105"
                          }`}
                        >
                          <RotateCcw className={`w-3 h-3 ${refillingId === ord.id ? "animate-spin" : ""}`} />
                          <span>{ord.refillStatus === "REQUESTED" ? "Refill Queued" : "1-Click Refill"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No orders found matching your search.
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
