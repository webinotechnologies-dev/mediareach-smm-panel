"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Wallet,
  Percent,
  Ban,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCheck
} from "lucide-react";
import { formatINR, formatNumber, formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  username: string;
  role: string;
  balance: number;
  isBanned: boolean;
  customDiscountPercent: number;
  createdAt: string | Date;
  _count: {
    orders: number;
    transactions: number;
  };
}

export default function AdminUsersClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  // Balance adjustment modal
  const [balanceUser, setBalanceUser] = useState<UserItem | null>(null);
  const [amount, setAmount] = useState("100");

  // Discount modal
  const [discountUser, setDiscountUser] = useState<UserItem | null>(null);
  const [discountPercent, setDiscountPercent] = useState("5");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUser) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADJUST_BALANCE",
          targetUserId: balanceUser.id,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust balance");

      setBalanceUser(null);
      setMessage({ text: "✅ Balance updated successfully!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountUser) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_DISCOUNT",
          targetUserId: discountUser.id,
          discountPercent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set discount");

      setDiscountUser(null);
      setMessage({ text: "✅ VIP discount percentage updated!", type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (user: UserItem) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_BAN",
          targetUserId: user.id,
          isBanned: !user.isBanned,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle ban");

      setMessage({ text: `✅ User ${user.username} ${!user.isBanned ? "banned" : "unbanned"}`, type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Users & Wallets Manager
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage user balances, custom discounts, and account access
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or email..."
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

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">VIP Discount</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{u.username}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(u.balance)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">
                    {u.customDiscountPercent > 0 ? `${u.customDiscountPercent}% OFF` : "Standard"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div>{u._count.orders} orders</div>
                    <div className="text-[10px]">{u._count.transactions} transactions</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.isBanned ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        BANNED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setBalanceUser(u)}
                      title="Adjust Wallet Balance"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-bold"
                    >
                      +/- Balance
                    </button>
                    <button
                      onClick={() => setDiscountUser(u)}
                      title="Set VIP Discount"
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-bold"
                    >
                      VIP %
                    </button>
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => handleToggleBan(u)}
                        title={u.isBanned ? "Unban User" : "Ban User"}
                        className={`p-1.5 rounded-lg border ${
                          u.isBanned
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {balanceUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-emerald-500/30">
            <h3 className="text-base font-black text-white mb-2">
              Adjust Balance for @{balanceUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Current: <b>{formatINR(balanceUser.balance)}</b>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Amount to Add (or enter negative to deduct)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500 or -100"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-emerald-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBalanceUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn-success text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Updating..." : "Confirm Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set VIP Discount Modal */}
      {discountUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-indigo-500/30">
            <h3 className="text-base font-black text-white mb-2">
              VIP Discount for @{discountUser.username}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              This discount will apply to all orders placed by this user automatically.
            </p>

            <form onSubmit={handleSetDiscount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-cyan-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscountUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Saving..." : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
