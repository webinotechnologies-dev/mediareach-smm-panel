"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/new-order");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (type: "ADMIN" | "USER") => {
    if (type === "ADMIN") {
      setIdentifier("admin@smmpanel.com");
      setPassword("admin12345password");
    } else {
      setIdentifier("demo@smmpanel.com");
      setPassword("demo12345password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-4" />
          <h1 className="text-2xl font-black tracking-tight text-white">
            Welcome to <span className="gradient-text">MediaReach</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            India's #1 Automated Digital Growth & Reach Platform
          </p>
        </div>

        {/* Quick Demo Fill Buttons (For instant testing) */}
        <div className="glass-card p-3 rounded-2xl mb-5 border-indigo-500/30 bg-indigo-950/20">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>1-Click Test Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo("ADMIN")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Account</span>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo("USER")}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo Customer</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl">
          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@smmpanel.com"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glow-btn text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold">
              Sign Up (Get ₹100 Bonus)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
