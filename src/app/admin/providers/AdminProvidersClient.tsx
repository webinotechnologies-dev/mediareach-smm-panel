"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Network,
  PlusCircle,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Wallet,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface ProviderItem {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  balance: number;
  currency: string;
  status: string;
  isDefault: boolean;
  _count: {
    services: number;
  };
}

export default function AdminProvidersClient({
  initialProviders,
}: {
  initialProviders: ProviderItem[];
}) {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderItem[]>(initialProviders);
  const [checkingBalanceId, setCheckingBalanceId] = useState<string | null>(null);

  // New Provider Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [currency, setCurrency] = useState("INR");

  // Import Services Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    initialProviders[0]?.id || ""
  );
  const [marginPercent, setMarginPercent] = useState<string>("45");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleCheckBalance = async (providerId: string) => {
    setCheckingBalanceId(providerId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/providers/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check provider balance");

      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId ? { ...p, balance: data.balance, currency: data.currency } : p
        )
      );
      setMessage({ text: `✅ Live provider balance synced: ₹${data.balance.toFixed(2)}`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setCheckingBalanceId(null);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/providers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, apiUrl, apiKey, currency }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add provider");

      setShowAddModal(false);
      setName("");
      setApiUrl("");
      setApiKey("");
      setMessage({ text: "✅ New wholesale provider added successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImportServices = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/providers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: selectedProviderId, marginPercent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Service import failed");

      setShowImportModal(false);
      setMessage({ text: data.message, type: "success" });
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
            <Network className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Multi-Provider Routing Engine
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Connect upstream wholesale APIs (Peakerr, SMMFollows, Secsers, etc.) with 1-click import
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>1-Click Import Services</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Provider</span>
          </button>
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

      {/* Providers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  {p.isDefault && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                      Default Engine
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[220px]">{p.apiUrl}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  p.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border-white/5"
                }`}
              >
                {p.status}
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Wholesale Balance</span>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  {formatINR(p.balance)}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Linked Services</span>
                <div className="text-sm font-black text-white font-mono">
                  {p._count.services} Active
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>API Key: ••••••••{p.apiKey.slice(-4)}</span>
              </div>

              <button
                onClick={() => handleCheckBalance(p.id)}
                disabled={checkingBalanceId === p.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                <RefreshCw className={`w-3 h-3 text-cyan-400 ${checkingBalanceId === p.id ? "animate-spin" : ""}`} />
                <span>{checkingBalanceId === p.id ? "Checking..." : "Sync Balance"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-amber-500/30">
            <h3 className="text-lg font-black text-white mb-4">Connect New SMM Provider API</h3>

            <form onSubmit={handleAddProvider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Provider Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SMMFollows Direct Root API"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://smmfollows.com/api/v2"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">API Key</label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter secret API key from provider panel"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Connecting..." : "Add Provider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Service Importer Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-500/30">
            <h3 className="text-lg font-black text-white mb-2">1-Click Bulk Service Importer</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Fetch all services from upstream provider, auto-group into categories, and lock in your target profit margin.
            </p>

            <form onSubmit={handleImportServices} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Source Provider</label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} ({p.apiUrl})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Profit Markup Percentage (%)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["30", "45", "60", "100"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMarginPercent(p)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        marginPercent === p
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 text-slate-400 border border-white/5"
                      }`}
                    >
                      +{p}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn-success text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Importing..." : "Start Bulk Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
