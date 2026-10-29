"use client";

import { useState } from "react";
import { Sliders, Save, CheckCircle2, Shield, Bell, DollarSign } from "lucide-react";

export default function AdminSettingsClient() {
  const [siteName, setSiteName] = useState("MediaReach");
  const [currency, setCurrency] = useState("INR");
  const [minDeposit, setMinDeposit] = useState("10");
  const [announcement, setAnnouncement] = useState("⚡ Welcome to MediaReach! India's #1 Automated Digital Growth Engine with instant delivery & 0% drop protection.");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">
            System & Brand Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure site name, minimum deposits, announcements, and global currencies
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Website / Brand Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              <option value="INR" className="bg-slate-900">INR (₹ Indian Rupee)</option>
              <option value="USD" className="bg-slate-900">USD ($ US Dollar)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Minimum Deposit Amount (INR)
          </label>
          <input
            type="number"
            value={minDeposit}
            onChange={(e) => setMinDeposit(e.target.value)}
            className="w-full glass-input px-4 py-2.5 rounded-xl text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Customer Announcement Banner
          </label>
          <textarea
            rows={3}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full glass-input p-4 rounded-xl text-xs leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="glow-btn text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
}
