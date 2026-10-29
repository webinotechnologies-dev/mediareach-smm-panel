"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Zap, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Link2,
  Layers,
  ChevronRight
} from "lucide-react";
import { formatINR, formatNumber } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  categoryId: string;
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
  icon: string | null;
  services: Service[];
}

export default function NewOrderClient({
  initialCategories,
  recentOrders,
}: {
  initialCategories: Category[];
  recentOrders: any[];
}) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategories[0]?.id || ""
  );

  const selectedCategory = useMemo(() => {
    return initialCategories.find((c) => c.id === selectedCategoryId) || initialCategories[0];
  }, [initialCategories, selectedCategoryId]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    selectedCategory?.services[0]?.id || ""
  );

  // When category changes, reset selected service
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = initialCategories.find((c) => c.id === catId);
    if (cat && cat.services.length > 0) {
      setSelectedServiceId(cat.services[0].id);
    }
  };

  const selectedService = useMemo(() => {
    return (
      selectedCategory?.services.find((s) => s.id === selectedServiceId) ||
      selectedCategory?.services[0]
    );
  }, [selectedCategory, selectedServiceId]);

  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<string>("1000");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate live charge
  const charge = useMemo(() => {
    if (!selectedService) return 0;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return 0;
    return (selectedService.sellRate * qty) / 1000;
  }, [selectedService, quantity]);

  // Validation warning
  const linkWarning = useMemo(() => {
    if (!link) return null;
    const l = link.toLowerCase();
    if (selectedCategory?.platform === "INSTAGRAM") {
      if (!l.includes("instagram.com") && !l.includes("ig.me")) {
        return "⚠️ Make sure this is a valid Instagram profile/post link.";
      }
    } else if (selectedCategory?.platform === "YOUTUBE") {
      if (!l.includes("youtube.com") && !l.includes("youtu.be")) {
        return "⚠️ Make sure this is a valid YouTube video/channel link.";
      }
    } else if (selectedCategory?.platform === "TELEGRAM") {
      if (!l.includes("t.me") && !l.includes("telegram.me")) {
        return "⚠️ Make sure this is a valid Telegram channel or post link.";
      }
    }
    return null;
  }, [link, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          link,
          quantity,
          comments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order placement failed");
      }

      // Fire confetti celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccess(`🎉 Order placed successfully! ID: #${data.order.id.slice(0, 8)}. Remaining Balance: ₹${data.order.balanceRemaining.toFixed(2)}`);
      setLink("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Main Form */}
      <div className="flex-1 w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              ⚡ Instant Order Engine
            </span>
            <span className="text-xs text-slate-400">0% Drop Protection</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Place a New Order
          </h1>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-medium flex items-start gap-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <div>{success}</div>
          </div>
        )}

        {/* Order Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                1. Select Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {initialCategories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.name} ({cat.services.length} services)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Service Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                2. Select Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {selectedCategory?.services.map((srv) => (
                  <option key={srv.id} value={srv.id} className="bg-slate-900 text-white">
                    {srv.name} — {formatINR(srv.sellRate)} / 1K
                  </option>
                ))}
              </select>
            </div>

            {/* Service Feature Badges */}
            {selectedService && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                  <Clock className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-medium">Speed</span>
                  <span className="text-xs font-bold text-cyan-300 mt-0.5">
                    {selectedService.speedBadge}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-medium">Guarantee</span>
                  <span className="text-xs font-bold text-emerald-300 mt-0.5">
                    {selectedService.guaranteeBadge}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center text-center">
                  <Sparkles className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-[10px] text-slate-400 font-medium">Success Rate</span>
                  <span className="text-xs font-bold text-indigo-300 mt-0.5">
                    {selectedService.qualityRating}% Reliable
                  </span>
                </div>
              </div>
            )}

            {/* Service Description Box */}
            {selectedService?.description && (
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                  <Info className="w-3.5 h-3.5" />
                  <span>Service Guidelines & Details:</span>
                </div>
                <p>{selectedService.description}</p>
                <div className="pt-2 border-t border-indigo-500/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Min Quantity: <b>{formatNumber(selectedService.minQuantity)}</b></span>
                  <span>Max Quantity: <b>{formatNumber(selectedService.maxQuantity)}</b></span>
                </div>
              </div>
            )}

            {/* 3. Link Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                3. Target Link / Username
              </label>
              <div className="relative">
                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://instagram.com/p/yourpost or https://youtube.com/watch?v=..."
                  className="w-full glass-input pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
              {linkWarning && (
                <p className="text-xs text-amber-400 mt-1.5 font-medium">{linkWarning}</p>
              )}
            </div>

            {/* 4. Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4. Quantity
                </label>
                {selectedService && (
                  <span className="text-xs text-slate-400">
                    Min: {formatNumber(selectedService.minQuantity)} | Max: {formatNumber(selectedService.maxQuantity)}
                  </span>
                )}
              </div>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={selectedService?.minQuantity || 10}
                max={selectedService?.maxQuantity || 100000}
                placeholder="1000"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
              />
            </div>

            {/* Price Preview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Charge</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {formatINR(charge)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Rate per 1,000</span>
                <p className="text-sm font-bold text-slate-200">
                  {selectedService ? formatINR(selectedService.sellRate) : "₹0.00"}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedService}
              className="w-full glow-btn text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              <span>{loading ? "Processing Order..." : "Confirm & Place Order"}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Recent Live Activity & Guarantees */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {/* Why Choose Our Engine */}
        <div className="glass-panel p-5 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Buyer Protection Guarantees</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <span><b>Auto Refund:</b> 100% balance returned if order fails or is canceled.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span><b>1-Click Refill:</b> Guaranteed refill button in your Order History.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span><b>High Retention:</b> High-quality bot-filtered engagement profiles.</span>
            </li>
          </ul>
        </div>

        {/* Live Recent Orders Feed */}
        <div className="glass-card p-5 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Live Orders Activity</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((ord) => (
                <div key={ord.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-300 truncate max-w-[140px]">
                      {ord.service.name}
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {formatINR(ord.charge)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Qty: {formatNumber(ord.quantity)}</span>
                    <span className="text-indigo-300 font-medium">Verified Delivery</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No orders placed yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
