import Link from "next/link";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 shadow-xl shadow-indigo-500/10">
          <span className="text-4xl font-black tracking-tight">404</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The link you followed may be broken, or the page may have been removed or does not exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/services"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium text-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

