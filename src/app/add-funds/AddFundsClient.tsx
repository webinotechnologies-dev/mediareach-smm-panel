"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  CreditCard,
  QrCode,
  Coins,
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  method: string;
  status: string;
  utrNumber: string | null;
  notes: string | null;
  createdAt: string | Date;
}

export default function AddFundsClient({
  user,
  initialTransactions,
}: {
  user: any;
  initialTransactions: Transaction[];
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"UPI_QR" | "CRYPTO_USDT" | "MANUAL_BANK">("UPI_QR");
  const [amount, setAmount] = useState<string>("500");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const realUpiId = "shubhambhati3187@upi";
  const brandPayeeName = "MediaReach";
  const demoCryptoAddress = "TYs98bK7VbMediaReachTRC20UsdtOfficialDepositWalletAddress";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method,
          utrNumber: utrNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit failed");

      confetti({ particleCount: 90, spread: 70 });
      setSuccess(data.message);
      setUtrNumber("");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic UPI intent string with real UPI ID
  const upiIntent = `upi://pay?pa=${realUpiId}&pn=${encodeURIComponent(brandPayeeName)}&am=${amount || "100"}&cu=INR&tn=MediaReach_Wallet_Topup`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">
            Add Funds to Wallet
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Instant 24/7 automated deposits with zero transaction fees
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Payment Form & Gateway Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gateway Selector Tabs */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMethod("UPI_QR")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                method === "UPI_QR"
                  ? "bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Instant UPI Auto QR</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">GPay/PhonePe/Paytm</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CRYPTO_USDT")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                method === "CRYPTO_USDT"
                  ? "bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <Coins className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Crypto USDT</div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">TRC20 / Binance Pay</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("MANUAL_BANK")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                method === "MANUAL_BANK"
                  ? "bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Bank IMPS / NEFT</div>
              <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Direct Transfer</div>
            </button>
          </div>

          {/* Form & QR Container */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            {method === "UPI_QR" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/80 border border-white/10">
                  {/* Dynamic QR Code */}
                  <div className="p-3 rounded-2xl bg-white shadow-xl">
                    <QRCodeSVG value={upiIntent} size={140} level="M" />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      <Zap className="w-3 h-3" />
                      <span>Instant Auto-Credit</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Scan with any UPI app (<b>PhonePe, Google Pay, Paytm, BHIM</b>).
                    </p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs font-mono text-indigo-300 font-bold bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        {realUpiId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(realUpiId)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Amount Quick Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select or Enter Amount (INR)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {["100", "500", "1000", "2500"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                          amount === val
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter custom amount (Min ₹10)"
                    className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono font-bold text-emerald-400"
                  />
                </div>

                {/* UTR Input Form */}
                <form onSubmit={handleDeposit} className="space-y-4 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      12-Digit UPI Transaction ID / UTR
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 423589102938"
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enter the 12-digit UTR from your payment receipt for instant auto verification.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !utrNumber.trim()}
                    className="w-full glow-btn-success text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? "Verifying Payment..." : `Verify & Add ₹${amount || 0} to Wallet`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {method === "CRYPTO_USDT" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                  <b>USDT TRC20 Deposit:</b>
                  <p>Send USDT via TRC20 network. Rate: 1 USDT = ₹88.50 INR. Instant balance credit.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Deposit Wallet Address (TRC20)
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-amber-300">
                    <span className="truncate flex-1">{demoCryptoAddress}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(demoCryptoAddress)}
                      className="p-1.5 rounded-lg bg-slate-800 text-white text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Amount in INR (Min ₹500)
                    </label>
                    <input
                      type="number"
                      min="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Blockchain Transaction Hash (TxID)
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 7f9b8c..."
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !utrNumber.trim()}
                    className="w-full glow-btn text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? "Checking Blockchain..." : "Submit Crypto Deposit"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {method === "MANUAL_BANK" && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
                  <b>Bank Transfer Details:</b>
                  <p>Bank: HDFC Bank | A/C: 50200084920192 | IFSC: HDFC0001234 | Beneficiary: SMM Panel Global</p>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Amount Transferred (INR)
                    </label>
                    <input
                      type="number"
                      min="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Bank IMPS/NEFT Ref Number
                    </label>
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. IMPS192083948"
                      className="w-full glass-input px-4 py-3 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !utrNumber.trim()}
                    className="w-full glow-btn text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{loading ? "Submitting..." : "Submit Bank Deposit for Approval"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Wallet Stats & Recent Deposit History */}
        <div className="space-y-6">
          {/* Current Balance Card */}
          <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-3 border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-950">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {formatINR(user.balance)}
            </div>
            <p className="text-[11px] text-slate-400">
              Ready for instant 1-click orders and API requests.
            </p>
          </div>

          {/* Recent Deposit History */}
          <div className="glass-card p-5 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Deposit Transactions
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              {initialTransactions.length > 0 ? (
                initialTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-400 font-mono">
                        +{formatINR(tx.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No deposit records yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
