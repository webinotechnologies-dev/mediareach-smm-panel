import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { ArrowLeft, Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us | MediaReach",
  description: "Get in touch with MediaReach customer support team.",
};

export default function ContactPage() {
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
            <MessageCircle className="w-4 h-4" />
            <span>24/7 Customer Care</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Contact Us</h1>
          <p className="text-xs text-slate-400 mt-1">We are here to support your growth 24 hours a day, 7 days a week.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Official Support Email</div>
              <div className="text-sm font-bold text-white mt-1">mediareachsmm@gmail.com</div>
              <p className="text-[11px] text-slate-500 mt-1">Direct support responses within 1-2 hours.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Instant WhatsApp Desk</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">WhatsApp Live Support</div>
              <p className="text-[11px] text-slate-500 mt-1">Click the pulsating green chat button on any page.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Operating Hours</div>
              <div className="text-sm font-bold text-white mt-1">24 Hours / 7 Days a Week</div>
              <p className="text-[11px] text-slate-500 mt-1">Automated dispatch server runs 365 days continuously.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Operations HQ</div>
              <div className="text-sm font-bold text-white mt-1">MediaReach Technologies</div>
              <p className="text-[11px] text-slate-500 mt-1">India</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-indigo-400 transition-colors">
            Terms & Conditions
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-indigo-400 transition-colors">
            Refund & Cancellation Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

