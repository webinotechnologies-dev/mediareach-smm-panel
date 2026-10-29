import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowLeft, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy | MediaReach",
  description: "Official Refund and Cancellation Policy for MediaReach services.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto text-slate-300">
      <div className="mb-8 flex items-center justify-between">
        <BrandLogo size="md" />
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <RefreshCw className="w-4 h-4" />
            <span>Fair Customer Assurance</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Wallet Deposit Assurance</h2>
          <p className="text-sm leading-relaxed">
            When you deposit funds into your MediaReach wallet via Cashfree Payments or UPI, the amount is credited to your platform balance immediately upon transaction confirmation. If your payment was deducted from your bank account but not credited due to network latency, our automated reconciliation will credit your balance within 1 to 24 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Order Cancellations & Non-Delivery</h2>
          <p className="text-sm leading-relaxed">
            Once an order is placed and processed by the automated dispatch engine, it cannot be manually paused or cancelled while in progress. However, if an order fails to deliver or is cancelled by the upstream server (for example, due to an invalid or private URL), <strong>100% of the charged amount is automatically refunded</strong> back to your MediaReach wallet balance instantly.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Partial Deliveries</h2>
          <p className="text-sm leading-relaxed">
            In scenarios where an order is partially completed, the system calculates the exact undelivered portion and credits a proportional refund back to your wallet balance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Bank Account Refunds</h2>
          <p className="text-sm leading-relaxed">
            In exceptional cases where you deposited funds in error without utilizing any promotional services, you may raise a support ticket or contact our WhatsApp support within 48 hours of payment. Legitimate unused balances may be refunded back to the original payment source after deduction of nominal payment gateway processing charges.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Need help with an order or transaction? Reach out 24/7 on our{" "}
          <Link href="/contact" className="text-indigo-400 hover:underline">
            Support Desk
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

