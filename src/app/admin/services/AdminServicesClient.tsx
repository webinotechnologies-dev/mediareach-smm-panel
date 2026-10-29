"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Edit2,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Search
} from "lucide-react";
import { formatINR, formatNumber } from "@/lib/utils";

interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
  providerId: string | null;
  providerServiceId: string | null;
  wholesaleRate: number;
  sellRate: number;
  minQuantity: number;
  maxQuantity: number;
  speedBadge: string;
  guaranteeBadge: string;
  status: string;
  provider: {
    name: string;
  } | null;
}

interface CategoryItem {
  id: string;
  name: string;
  services: ServiceItem[];
}

export default function AdminServicesClient({
  initialCategories,
  providers,
}: {
  initialCategories: CategoryItem[];
  providers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalService, setEditModalService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states for edit
  const [editName, setEditName] = useState("");
  const [editWholesale, setEditWholesale] = useState("0");
  const [editSellRate, setEditSellRate] = useState("0");
  const [editMin, setEditMin] = useState("10");
  const [editMax, setEditMax] = useState("100000");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editSpeedBadge, setEditSpeedBadge] = useState("");
  const [editGuaranteeBadge, setEditGuaranteeBadge] = useState("");

  const openEdit = (srv: ServiceItem) => {
    setEditModalService(srv);
    setEditName(srv.name);
    setEditWholesale(String(srv.wholesaleRate));
    setEditSellRate(String(srv.sellRate));
    setEditMin(String(srv.minQuantity));
    setEditMax(String(srv.maxQuantity));
    setEditStatus(srv.status);
    setEditSpeedBadge(srv.speedBadge);
    setEditGuaranteeBadge(srv.guaranteeBadge);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalService) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModalService.id,
          name: editName,
          wholesaleRate: editWholesale,
          sellRate: editSellRate,
          minQuantity: editMin,
          maxQuantity: editMax,
          status: editStatus,
          speedBadge: editSpeedBadge,
          guaranteeBadge: editGuaranteeBadge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update service");

      setEditModalService(null);
      setMessage({ text: "✅ Service & Profit Margin updated successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Services & Profit Margins Manager
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Control wholesale costs, retail pricing, quality badges, and active availability
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service by name or ID..."
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

      {/* Services Tables */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-xl">
            <div className="py-3 px-5 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{cat.name}</span>
              <span className="text-xs text-slate-400 font-mono">{cat.services.length} services</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-950/40 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Wholesale Rate</th>
                    <th className="py-3 px-4">Sell Rate</th>
                    <th className="py-3 px-4">Net Profit Margin</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {cat.services.map((srv) => {
                    const profit = srv.sellRate - srv.wholesaleRate;
                    const profitPercent =
                      srv.wholesaleRate > 0
                        ? ((profit / srv.wholesaleRate) * 100).toFixed(0)
                        : "100";

                    return (
                      <tr key={srv.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                          #{srv.id.slice(0, 6)}
                        </td>
                        <td className="py-3 px-4 max-w-xs font-semibold text-white truncate">
                          {srv.name}
                        </td>
                        <td className="py-3 px-4 text-indigo-300 font-medium truncate max-w-[120px]">
                          {srv.provider?.name || "Mock Engine"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {formatINR(srv.wholesaleRate)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {formatINR(srv.sellRate)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            +{formatINR(profit)} ({profitPercent}%)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              srv.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {srv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openEdit(srv)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Service Modal */}
      {editModalService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-500/30">
            <h3 className="text-lg font-black text-white mb-4">Edit Service & Pricing Margin</h3>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Wholesale Cost (1k)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editWholesale}
                    onChange={(e) => setEditWholesale(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Selling Rate (1k)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editSellRate}
                    onChange={(e) => setEditSellRate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    required
                    value={editMin}
                    onChange={(e) => setEditMin(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    required
                    value={editMax}
                    onChange={(e) => setEditMax(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Speed Badge</label>
                  <input
                    type="text"
                    value={editSpeedBadge}
                    onChange={(e) => setEditSpeedBadge(e.target.value)}
                    placeholder="⚡ Instant (0-5 min)"
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-bold"
                  >
                    <option value="ACTIVE" className="bg-slate-900 text-emerald-400">ACTIVE</option>
                    <option value="DISABLED" className="bg-slate-900 text-rose-400">DISABLED</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalService(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
