"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  PlusCircle, 
  LogOut, 
  RefreshCw, 
  Zap, 
  User as UserIcon,
  HelpCircle,
  Bell
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { formatINR } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN";
  balance: number;
}

export default function Navbar({ initialUser }: { initialUser?: UserProfile | null }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(initialUser || null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      fetchUser();
    }
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/cron/sync");
      const data = await res.json();
      setSyncMessage(`Synced ${data.updatedCount || 0} orders`);
      await fetchUser();
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/new-order" className="flex items-center gap-3 group">
            <BrandLogo size="md" className="group-hover:scale-105 transition-transform duration-200" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Media</span>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Reach</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 font-medium hidden sm:block">India's #1 Social Growth Engine</p>
            </div>
          </Link>
        </div>

        {/* Right Action Hub */}
        <div className="flex items-center gap-3">
          {/* Order Sync Engine Button */}
          <button
            onClick={handleManualSync}
            disabled={syncing}
            title="Sync Orders with IndianSmartPanel"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-white/10 hover:border-indigo-500/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Status"}</span>
          </button>

          {syncMessage && (
            <span className="text-xs text-emerald-400 font-semibold animate-pulse hidden md:inline">
              {syncMessage}
            </span>
          )}

          {user ? (
            <>
              {/* Wallet Balance Pill */}
              <div className="flex items-center bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-1 pr-3 shadow-lg shadow-emerald-500/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mr-2 border border-emerald-500/20">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Balance</span>
                  <span className="text-xs font-bold text-emerald-400">{formatINR(user.balance)}</span>
                </div>
                <Link
                  href="/add-funds"
                  className="ml-3 p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Add Funds via 0% Fee Instant UPI"
                >
                  <PlusCircle className="w-4 h-4" />
                </Link>
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs font-bold">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                  <span className="text-[10px] text-slate-400">{user.email}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
