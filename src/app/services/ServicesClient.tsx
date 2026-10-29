"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Zap,
  ShoppingBag
} from "lucide-react";
import { formatINR, formatNumber } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  wholesaleRate: number;
  sellRate: number;
  minQuantity: number;
  maxQuantity: number;
  speedBadge: string;
  guaranteeBadge: string;
  qualityRating: number;
  description: string | null;
  dripfeedSupported: boolean;
  cancelSupported: boolean;
  refillSupported: boolean;
}

interface Category {
  id: string;
  name: string;
  platform: string;
  services: Service[];
}

const platforms = [
  { id: "ALL", label: "All Platforms" },
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "YOUTUBE", label: "YouTube" },
  { id: "TELEGRAM", label: "Telegram" },
  { id: "FACEBOOK", label: "Facebook" },
  { id: "TWITTER", label: "Twitter / X" },
];

export default function ServicesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [selectedPlatform, setSelectedPlatform] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return initialCategories
      .filter((cat) => selectedPlatform === "ALL" || cat.platform === selectedPlatform)
      .map((cat) => {
        const filteredServices = cat.services.filter((srv) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            srv.id.toLowerCase().includes(q) ||
            srv.name.toLowerCase().includes(q) ||
            (srv.description && srv.description.toLowerCase().includes(q))
          );
        });
        return { ...cat, services: filteredServices };
      })
      .filter((cat) => cat.services.length > 0);
  }, [initialCategories, selectedPlatform, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Services & Wholesale Rates
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse live verified social marketing services with speed and guarantee badges
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services or ID..."
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedPlatform === p.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Services List Grouped by Category */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/10">
              {/* Category Header */}
              <div className="py-3 px-5 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h2 className="text-sm font-bold text-white tracking-wide">{cat.name}</h2>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-white/5">
                  {cat.services.length} services
                </span>
              </div>

              {/* Services Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4 w-24">ID</th>
                      <th className="py-3 px-4">Service Details</th>
                      <th className="py-3 px-4">Rate / 1K</th>
                      <th className="py-3 px-4">Min / Max</th>
                      <th className="py-3 px-4">Speed & Guarantee</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {cat.services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          #{srv.id.slice(0, 6)}
                        </td>

                        {/* Name & Expandable description */}
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-semibold text-white leading-snug">
                            {srv.name}
                          </div>
                          {srv.description && (
                            <button
                              onClick={() =>
                                setExpandedServiceId(expandedServiceId === srv.id ? null : srv.id)
                              }
                              className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-1"
                            >
                              <Info className="w-3 h-3" />
                              <span>{expandedServiceId === srv.id ? "Hide details" : "View description"}</span>
                            </button>
                          )}
                          {expandedServiceId === srv.id && srv.description && (
                            <div className="p-3 mt-2 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                              {srv.description}
                            </div>
                          )}
                        </td>

                        {/* Rate */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-emerald-400 font-mono text-sm">
                            {formatINR(srv.sellRate)}
                          </div>
                        </td>

                        {/* Min / Max */}
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          <div>Min: {formatNumber(srv.minQuantity)}</div>
                          <div>Max: {formatNumber(srv.maxQuantity)}</div>
                        </td>

                        {/* Badges */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <span>{srv.speedBadge}</span>
                          </div>
                          <br />
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <span>{srv.guaranteeBadge}</span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/new-order?service=${srv.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Order</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-400 glass-panel rounded-3xl">
            No services found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
