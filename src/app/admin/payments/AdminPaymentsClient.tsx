"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  Wallet
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";

export default function AdminPaymentsClient({ initialTransactions }: { initialTransactions: any[] }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      tx.user?.username?.toLowerCase().includes(q) ||
      (tx.utrNumber && tx.utrNumber.toLowerCase().includes(q))
    );
  });

  const handleAction = async (transactionId: string, action: "APPROVE" | "REJECT") => {
    setLoadingId(transactionId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setMessage({ text: `✅ ${data.message}`, type: "success" });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Payment & Deposit Approvals Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review UPI UTRs, bank receipts, and credit customer wallet balances with 1-click
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or UTR..."
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

      {/* Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">UTR / Transaction ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {tx.user?.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-indigo-300 font-medium">
                      {tx.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatINR(tx.amount)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {tx.utrNumber || "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : tx.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {tx.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => handleAction(tx.id, "APPROVE")}
                          disabled={loadingId === tx.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => handleAction(tx.id, "REJECT")}
                          disabled={loadingId === tx.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
