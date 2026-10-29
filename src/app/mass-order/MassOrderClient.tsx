"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Zap, Info, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface ServiceMinimal {
  id: string;
  name: string;
  sellRate: number;
  minQuantity: number;
  maxQuantity: number;
}

export default function MassOrderClient({ services }: { services: ServiceMinimal[] }) {
  const router = useRouter();
  const [massText, setMassText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ successCount: number; failCount: number; errors: string[] } | null>(null);

  const handleMassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!massText.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const lines = massText.trim().split("\n");
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 3) {
        failCount++;
        errors.push(`Line #${i + 1}: Invalid format. Expected: service_id | link | quantity`);
        continue;
      }

      const [serviceId, link, quantity] = parts;

      try {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId, link, quantity }),
        });

        const data = await res.json();
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
          errors.push(`Line #${i + 1}: ${data.error || "Failed"}`);
        }
      } catch (err: any) {
        failCount++;
        errors.push(`Line #${i + 1}: ${err.message}`);
      }
    }

    setLoading(false);
    setResults({ successCount, failCount, errors });

    if (successCount > 0) {
      confetti({ particleCount: 70, spread: 60 });
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Mass Order Generator</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Place up to 100 bulk orders at once in one single submission
        </p>
      </div>

      {results && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-emerald-400">✅ {results.successCount} Orders Placed</span>
            {results.failCount > 0 && <span className="text-rose-400">❌ {results.failCount} Failed</span>}
          </div>
          {results.errors.length > 0 && (
            <ul className="text-[11px] text-rose-300 space-y-1 pt-2 border-t border-white/5">
              {results.errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Guide Card */}
      <div className="glass-card p-4 rounded-2xl border-indigo-500/20 bg-indigo-950/20 text-xs text-slate-300 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <Info className="w-4 h-4" />
          <span>Mass Order Formatting Guide:</span>
        </div>
        <p>Enter one order per line using the exact vertical bar (<code>|</code>) format:</p>
        <div className="p-2.5 rounded-xl bg-slate-950/80 font-mono text-[11px] text-indigo-300 border border-indigo-500/20">
          service_id | link | quantity<br />
          {services[0]?.id || "clxyz123"} | https://instagram.com/p/reel123 | 1000<br />
          {services[0]?.id || "clxyz123"} | https://instagram.com/p/reel456 | 2000
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleMassSubmit} className="space-y-4">
        <textarea
          required
          rows={10}
          value={massText}
          onChange={(e) => setMassText(e.target.value)}
          placeholder={`${services[0]?.id || "service_id"} | https://instagram.com/yourlink | 1000`}
          className="w-full glass-input p-4 rounded-2xl text-xs font-mono leading-relaxed"
        />

        <button
          type="submit"
          disabled={loading || !massText.trim()}
          className="w-full glow-btn text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{loading ? "Processing Batch Orders..." : "Submit Mass Orders"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
