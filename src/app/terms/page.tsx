import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | MediaReach",
  description: "Terms and Conditions of service for MediaReach SMM panel.",
};

export default function TermsPage() {
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
            <Shield className="w-4 h-4" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Introduction & Acceptance</h2>
          <p className="text-sm leading-relaxed">
            Welcome to MediaReach (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing, registering, or using our automated digital marketing and social media promotion services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Nature of Services</h2>
          <p className="text-sm leading-relaxed">
            MediaReach provides automated wholesale marketing and promotional distribution services for digital content creators, brands, and agencies. We operate as an optimization intermediary and do not claim official affiliation or endorsement with Instagram, YouTube, Facebook, Telegram, or any third-party social media platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. User Responsibilities & Account Security</h2>
          <p className="text-sm leading-relaxed">
            You must maintain the confidentiality of your account credentials. You agree to submit public, unrestricted URLs for all campaigns. You may not use MediaReach for any unlawful, defamatory, or abusive purposes that infringe on applicable laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Payment & Wallet Deposits</h2>
          <p className="text-sm leading-relaxed">
            All services are provided on a prepaid wallet model. Funds deposited via our authorized payment partners (including Cashfree Payments, UPI, and bank transfers) are credited to your platform account balance. Users confirm that all payment credentials used belong to them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Governing Law</h2>
          <p className="text-sm leading-relaxed">
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          For inquiries or assistance, please reach out via our{" "}
          <Link href="/contact" className="text-indigo-400 hover:underline">
            Contact Support Desk
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

