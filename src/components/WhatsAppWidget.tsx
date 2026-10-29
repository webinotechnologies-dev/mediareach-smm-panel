"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppWidget() {
  const [phoneNumber, setPhoneNumber] = useState<string>("+919876543210");
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Fetch configured phone number from settings
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.whatsappSupport && data.settings.whatsappSupport.length > 5) {
          setPhoneNumber(data.settings.whatsappSupport);
        }
      })
      .catch(() => {});
  }, []);

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const defaultText = encodeURIComponent(
    "Hello MediaReach Support! I need help with SMM services / wallet deposit."
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${defaultText}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip / Popup */}
      {showTooltip && (
        <div className="mb-3 max-w-xs rounded-2xl glass-panel p-4 shadow-2xl border border-emerald-500/30 text-white animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Support Online (24/7)</span>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Have questions about orders or adding funds? Chat with us directly on WhatsApp!
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
          >
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse" />
        <MessageCircle className="w-7 h-7 text-white fill-current transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
}

