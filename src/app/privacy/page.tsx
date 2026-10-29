import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MediaReach",
  description: "Privacy policy and data protection guidelines for MediaReach.",
};

export default function PrivacyPage() {
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
            <Lock className="w-4 h-4" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            We collect personal information necessary to deliver and manage your account: email address, username, transaction identification records (such as UTR numbers or Cashfree order references), and public campaign URLs provided for order dispatch. We never ask for or store passwords to your personal social media accounts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. How We Use Your Data</h2>
          <p className="text-sm leading-relaxed">
            Your data is used solely to execute marketing orders, process wallet top-ups via certified payment aggregators, provide customer support, and detect potential fraudulent activities. We do not sell or rent user data to third-party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Payment Information Security</h2>
          <p className="text-sm leading-relaxed">
            All monetary transactions are processed through RBI-licensed payment aggregators (e.g., Cashfree Payments) using bank-grade 256-bit SSL encryption. We do not store sensitive payment credentials such as full card numbers, CVVs, or UPI PINs on our servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Cookies & Session Storage</h2>
          <p className="text-sm leading-relaxed">
            We use essential secure session cookies to keep you authenticated and to protect your account against unauthorized requests.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Have privacy questions? Please contact our data privacy officer via{" "}
          <Link href="/contact" className="text-indigo-400 hover:underline">
            Support Desk
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

