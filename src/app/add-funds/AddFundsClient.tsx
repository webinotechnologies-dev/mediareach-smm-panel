"use client";

import { useState, useEffect } from "react";
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
  Gift,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
  Check,
  MousePointerClick
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
  upiId = "shubhambhati3187@upi",
  siteName = "MediaReach",
  minDeposit = 10,
  whatsappSupport = "",
}: {
  user: any;
  initialTransactions: Transaction[];
  upiId?: string;
  siteName?: string;
  minDeposit?: number;
  whatsappSupport?: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"UPI_QR" | "CHECKOUT_1CLICK" | "CRYPTO_USDT" | "MANUAL_BANK">("UPI_QR");
  const [amount, setAmount] = useState<string>("500");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [qrViewMode, setQrViewMode] = useState<"DYNAMIC" | "OFFICIAL_IMAGE">("DYNAMIC");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [currentBalance, setCurrentBalance] = useState<number>(user?.balance || 0);

  const realUpiId = upiId || "shubhambhati3187@upi";
  const brandPayeeName = siteName || "MediaReach";
  const demoCryptoAddress = "TYs98bK7VbMediaReachTRC20UsdtOfficialDepositWalletAddress";

  const cleanAmountNum = parseFloat(amount) || 0;

  // Generate dynamic UPI intent string with real UPI ID & dynamic exact amount
  const upiIntent = `upi://pay?pa=${realUpiId}&pn=${encodeURIComponent(
    brandPayeeName
  )}&am=${amount || "100"}&cu=INR&tn=${encodeURIComponent(
    `${brandPayeeName}_Wallet_Topup`
  )}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Handle Auto-UTR Deposit Verification
  const handleUtrDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setError("Please enter the 12-digit UTR / Transaction Reference ID from your UPI app.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: "UPI_QR",
          utrNumber: cleanUtr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deposit failed");

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setSuccess(data.message);
      setUtrNumber("");

      if (data.balance !== undefined) {
        setCurrentBalance(data.balance);
      }

      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Cashfree redirect verification on return
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const cfOrderId = urlParams.get("cf_order_id") || urlParams.get("order_id");
    if (cfOrderId) {
      setLoading(true);
      fetch("/api/payments/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cfOrderId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            confetti({ particleCount: 140, spread: 90 });
            setSuccess(data.message || "Payment verified & credited!");
            setCurrentBalance((prev) => prev + (data.amount || 0));
            router.replace("/add-funds");
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [router]);

  // 2. Handle 1-Click Direct Gateway Checkout
  const handle1ClickCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/payments/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize 1-click checkout");

      if (data.provider === "CASHFREE" && data.paymentSessionId) {
        // Load Cashfree SDK v3
        const loadCashfree = async () => {
          if ((window as any).Cashfree) return (window as any).Cashfree;
          return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            script.onload = () => resolve((window as any).Cashfree);
            script.onerror = reject;
            document.body.appendChild(script);
          });
        };

        const Cashfree = await loadCashfree();
        const cashfree = Cashfree({
          mode: data.mode || "sandbox",
        });

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_modal",
        }).then(async (result: any) => {
          if (result.error) {
            setError(result.error.message || "Payment cancelled or failed");
          }
          if (result.paymentDetails) {
            // Instant verification & credit
            const vRes = await fetch("/api/payments/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            });
            const vData = await vRes.json();
            if (vData.success) {
              confetti({ particleCount: 150, spread: 80 });
              setSuccess(vData.message || "Payment Successful! Wallet Credited.");
              setCurrentBalance((prev) => prev + (vData.amount || data.amount));
              router.refresh();
            }
          }
        });
      } else if (data.provider === "RAZORPAY") {
        // Open Razorpay Standard Checkout
        const options = {
          key: data.keyId,
          amount: data.amount * 100,
          currency: data.currency,
          name: data.name,
          description: data.description,
          order_id: data.orderId,
          handler: async function (response: any) {
            confetti({ particleCount: 140, spread: 90 });
            setSuccess(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
            router.refresh();
          },
          prefill: {
            name: data.user.name,
            email: data.user.email,
          },
          theme: { color: "#6366f1" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct Mobile UPI Intent Trigger
        if (data.upiIntentUrl) {
          window.location.href = data.upiIntentUrl;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Add Funds to Wallet
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dual Automated Gateways: <b>Dynamic Auto-UTR QR</b> + <b>1-Click Direct Checkout</b>
          </p>
        </div>

        {/* Live Wallet Balance Pill */}
        <div className="glass-card px-4 py-2.5 rounded-2xl border-emerald-500/30 bg-emerald-950/20 flex items-center gap-3 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Current Balance
            </div>
            <div className="text-lg font-black text-emerald-300 font-mono">
              {formatINR(currentBalance)}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fade-in shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-semibold text-sm">{success}</span>
        </div>
      )}

      {/* Main Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Payment Form & Gateway Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gateway Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setMethod("UPI_QR")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                method === "UPI_QR"
                  ? "bg-gradient-to-br from-emerald-900/60 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Dynamic Auto QR</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">0% Fee (Auto-UTR)</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CHECKOUT_1CLICK")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                method === "CHECKOUT_1CLICK"
                  ? "bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1.5">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">1-Click Checkout</div>
              <div className="text-[10px] text-indigo-300 font-semibold mt-0.5">Instant Webhook</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("CRYPTO_USDT")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                method === "CRYPTO_USDT"
                  ? "bg-gradient-to-br from-amber-900/60 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5">
                <Coins className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Crypto USDT</div>
              <div className="text-[10px] text-amber-400 font-semibold mt-0.5">TRC20 Binance</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("MANUAL_BANK")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                method === "MANUAL_BANK"
                  ? "bg-gradient-to-br from-cyan-900/60 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/15"
                  : "bg-slate-900/60 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Bank IMPS</div>
              <div className="text-[10px] text-cyan-400 font-semibold mt-0.5">Direct Transfer</div>
            </button>
          </div>

          {/* Form & QR Container */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 border border-white/10">
            {/* METHOD 1: DYNAMIC AUTO-UTR QR CODE */}
            {method === "UPI_QR" && (
              <form onSubmit={handleUtrDeposit} className="space-y-6">
                {/* Step 1: Amount Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Enter Deposit Amount (INR)</span>
                    </label>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Min: ₹{minDeposit} | 0% Fee
                    </span>
                  </div>

                  {/* Fast Select Amount Buttons */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {["100", "250", "500", "1000", "2000", "5000"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          amount === val
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
                            : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={minDeposit}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full glass-input pl-8 pr-4 py-3 rounded-2xl text-base font-bold font-mono text-white"
                    />
                  </div>
                </div>

                {/* Step 2: Dynamic QR Code Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Scan & Pay ₹{cleanAmountNum || 0}</span>
                    </label>

                    {/* QR View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setQrViewMode("DYNAMIC")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          qrViewMode === "DYNAMIC"
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Dynamic (Auto ₹{cleanAmountNum})
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrViewMode("OFFICIAL_IMAGE")}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          qrViewMode === "OFFICIAL_IMAGE"
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Official Standee
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-950/80 border border-white/10">
                    {/* QR Code Graphic */}
                    <div className="p-3 rounded-2xl bg-white shadow-2xl flex flex-col items-center justify-center shrink-0">
                      {qrViewMode === "DYNAMIC" ? (
                        <>
                          <QRCodeSVG value={upiIntent} size={150} level="M" />
                          <div className="text-[10px] font-bold text-slate-900 mt-1 font-mono">
                            PAY ₹{cleanAmountNum}
                          </div>
                        </>
                      ) : (
                        <img
                          src="/merchant-qr.jpeg"
                          alt="Official Merchant QR Code"
                          className="w-[150px] h-[150px] object-contain rounded-lg"
                        />
                      )}
                    </div>

                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Pre-filled Amount: ₹{cleanAmountNum}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Scan using any UPI App (<b>PhonePe, Google Pay, Paytm, BHIM, CRED</b>) on your phone.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                        <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                          {realUpiId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(realUpiId)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? "Copied!" : "Copy VPA"}</span>
                        </button>
                      </div>

                      {/* Direct UPI App Intent Trigger for Mobile Users */}
                      <div className="pt-1">
                        <a
                          href={upiIntent}
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium"
                        >
                          <span>Open in PhonePe / GPay / Paytm directly</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Enter 12-Digit Transaction ID (UTR) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>Submit 12-Digit Transaction ID (UTR / Ref No)</span>
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="e.g. 426819284719"
                      className="w-full glass-input px-4 py-3 rounded-2xl text-sm font-mono tracking-wider text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <b>Tip:</b> After successful payment in your UPI app, copy the 12-digit <b>UTR / UPI Ref ID / Transaction ID</b> from the receipt and paste it here.
                  </p>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading || !utrNumber.trim()}
                  className="w-full glow-btn-success text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Transaction ID...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Verify & Add ₹{cleanAmountNum || 0} to Wallet</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* METHOD 2: 1-CLICK DIRECT CHECKOUT GATEWAY */}
            {method === "CHECKOUT_1CLICK" && (
              <form onSubmit={handle1ClickCheckout} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Enter Deposit Amount (INR)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {["100", "250", "500", "1000", "2000", "5000"].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          amount === val
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40"
                            : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-white/5"
                        }`}
                      >
                        ₹{val}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min={minDeposit}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full glass-input pl-8 pr-4 py-3 rounded-2xl text-base font-bold font-mono text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Instant 1-Click Payment Mode</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Clicking the button below will open your preferred UPI App (PhonePe, Google Pay, Paytm) or card checkout directly. Your wallet will be credited automatically upon successful payment.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full glow-btn text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Launching Payment Gateway...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-amber-300" />
                      <span>Pay ₹{cleanAmountNum || 0} via 1-Click Gateway</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Crypto USDT Tab */}
            {method === "CRYPTO_USDT" && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-amber-400">USDT TRC-20 Deposit Address:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300 break-all bg-slate-900 p-2.5 rounded-xl flex-1 border border-white/5">
                      {demoCryptoAddress}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(demoCryptoAddress)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Network: <b>TRC20</b>. Rate: $1 = ₹87.50 INR. Min deposit: $5 USD.
                  </p>
                </div>
              </div>
            )}

            {/* Bank Transfer Tab */}
            {method === "MANUAL_BANK" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="font-bold text-cyan-400 mb-2">Direct IMPS / NEFT Details:</div>
                  <div><b>Bank Name:</b> Official Banking Partner</div>
                  <div><b>Account Name:</b> {brandPayeeName} Digital Solutions</div>
                  <div><b>UPI ID:</b> {realUpiId}</div>
                  <div><b>Deposit Time:</b> 24x7 Instant Verification</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Security & Perks Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 bg-indigo-950/10 space-y-4">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Automated & Safe</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Zero Transaction Fees on all UPI payments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Instant Wallet balance update 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Auto-refund safety if order cannot be fulfilled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Encrypted 256-bit secure transaction pipeline</span>
              </li>
            </ul>
          </div>

          {/* Need Help WhatsApp Support Card */}
          {whatsappSupport && (
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/20 bg-emerald-950/15 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Payment Help & Support</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Need instant assistance?</div>
              </div>
              <a
                href={`https://wa.me/${whatsappSupport.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20need%20help%20with%20my%20wallet%20deposit`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Recent Deposit Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-bold text-white">Recent Payment Transactions</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {transactions.length} Records
          </span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Type / Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Transaction UTR</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No deposit transactions found yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{tx.method || "UPI_QR"}</div>
                        <div className="text-[10px] text-slate-400">{tx.type}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                        +{formatINR(tx.amount)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {tx.utrNumber ? (
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                            {tx.utrNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : tx.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {tx.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === "PENDING" && <Clock className="w-3 h-3" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {formatINR(tx.balanceAfter)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
