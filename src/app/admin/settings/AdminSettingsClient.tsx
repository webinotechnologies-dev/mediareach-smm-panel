"use client";

import { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle2, QrCode, Phone, Loader2, Key, CreditCard, Shield, Zap } from "lucide-react";

export default function AdminSettingsClient() {
  const [siteName, setSiteName] = useState("MediaReach");
  const [currency, setCurrency] = useState("INR");
  const [minDeposit, setMinDeposit] = useState("10");
  const [autoMarginPercent, setAutoMarginPercent] = useState("50");
  const [upiId, setUpiId] = useState("shubhambhati3187@upi");
  const [whatsappSupport, setWhatsappSupport] = useState("+91");
  const [autoUpiApiKey, setAutoUpiApiKey] = useState("");
  const [autoUpiEndpoint, setAutoUpiEndpoint] = useState("https://api.ekqr.in/api/v1");
  const [pgProvider, setPgProvider] = useState("RAZORPAY");
  const [pgKeyId, setPgKeyId] = useState("");
  const [pgSecretKey, setPgSecretKey] = useState("");
  const [announcement, setAnnouncement] = useState(
    "⚡ Welcome to MediaReach! India's #1 Automated Digital Growth Engine with instant delivery & 0% drop protection."
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (data.settings.siteName) setSiteName(data.settings.siteName);
          if (data.settings.currency) setCurrency(data.settings.currency);
          if (data.settings.minDeposit) setMinDeposit(data.settings.minDeposit);
          if (data.settings.autoMarginPercent) setAutoMarginPercent(data.settings.autoMarginPercent);
          if (data.settings.upiId) setUpiId(data.settings.upiId);
          if (data.settings.whatsappSupport) setWhatsappSupport(data.settings.whatsappSupport);
          if (data.settings.autoUpiApiKey) setAutoUpiApiKey(data.settings.autoUpiApiKey);
          if (data.settings.autoUpiEndpoint) setAutoUpiEndpoint(data.settings.autoUpiEndpoint);
          if (data.settings.pgProvider) setPgProvider(data.settings.pgProvider);
          if (data.settings.pgKeyId) setPgKeyId(data.settings.pgKeyId);
          if (data.settings.pgSecretKey) setPgSecretKey(data.settings.pgSecretKey);
          if (data.settings.announcement) setAnnouncement(data.settings.announcement);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName,
          currency,
          minDeposit,
          autoMarginPercent,
          upiId,
          whatsappSupport,
          autoUpiApiKey,
          autoUpiEndpoint,
          pgProvider,
          pgKeyId,
          pgSecretKey,
          announcement,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">
            System & Payment Gateway Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure site branding, Auto-UTR API verification, 1-Click Gateway (Razorpay/Cashfree), and profit margins
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Payment Gateway & System settings saved successfully in database!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-2 animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        {/* Basic Brand Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Website / Brand Name
            </label>
            <input
              type="text"
              required
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900"
            >
              <option value="INR" className="bg-slate-900">INR (₹ Indian Rupee)</option>
              <option value="USD" className="bg-slate-900">USD ($ US Dollar)</option>
            </select>
          </div>
        </div>

        {/* Section 1: Auto-UTR & UPI Configuration */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Method 1: Dynamic UPI QR & Auto-UTR Verification Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Official BHIM / Merchant UPI ID (VPA)
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. shubhambhati3187@upi"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-emerald-300 border-emerald-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Auto-UTR API Key (BharatUPI / EkQR / Custom)
              </label>
              <input
                type="password"
                value={autoUpiApiKey}
                onChange={(e) => setAutoUpiApiKey(e.target.value)}
                placeholder="Optional: Auto-UTR Verification API Key"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: 1-Click Gateway Configuration */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/20 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Method 2: 1-Click Automated Payment Gateway (Razorpay / Cashfree)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Gateway Provider
              </label>
              <select
                value={pgProvider}
                onChange={(e) => setPgProvider(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900"
              >
                <option value="RAZORPAY" className="bg-slate-900">Razorpay PG</option>
                <option value="CASHFREE" className="bg-slate-900">Cashfree PG</option>
                <option value="PHONEPE" className="bg-slate-900">PhonePe PG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Gateway Key ID / App ID
              </label>
              <input
                type="text"
                value={pgKeyId}
                onChange={(e) => setPgKeyId(e.target.value)}
                placeholder="e.g. rzp_live_xxxxxxxx"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Gateway Secret Key
              </label>
              <input
                type="password"
                value={pgSecretKey}
                onChange={(e) => setPgSecretKey(e.target.value)}
                placeholder="Gateway Secret Key"
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Support & Profit Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              WhatsApp Support Number
            </label>
            <input
              type="text"
              value={whatsappSupport}
              onChange={(e) => setWhatsappSupport(e.target.value)}
              placeholder="+919876543210"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Minimum Deposit (INR)
            </label>
            <input
              type="number"
              min="1"
              required
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Global Markup Margin (%)
            </label>
            <input
              type="number"
              min="0"
              max="500"
              required
              value={autoMarginPercent}
              onChange={(e) => setAutoMarginPercent(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Customer Announcement Banner
          </label>
          <textarea
            rows={3}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full glass-input p-4 rounded-xl text-xs leading-relaxed text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || fetching}
          className="glow-btn text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving All Gateway Settings...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save System & Payment Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
