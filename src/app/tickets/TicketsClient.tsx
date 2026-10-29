"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeadphonesIcon,
  PlusCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  Shield,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TicketMessage {
  id: string;
  senderRole: string;
  message: string;
  createdAt: string | Date;
  senderUser: {
    username: string;
    role: string;
  };
}

interface TicketItem {
  id: string;
  subject: string;
  category: string;
  orderId: string | null;
  status: string;
  priority: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages: TicketMessage[];
}

export default function TicketsClient({
  initialTickets,
  userRole,
}: {
  initialTickets: TicketItem[];
  userRole: string;
}) {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(
    initialTickets[0]?.id || null
  );

  // New ticket modal/form state
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("ORDER");
  const [orderId, setOrderId] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          category,
          orderId,
          message: initialMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket");

      setShowNewModal(false);
      setSubject("");
      setOrderId("");
      setInitialMessage("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tickets/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicket.id,
          message: replyMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post reply");

      setReplyMessage("");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeadphonesIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              Support & Query Desk
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fast resolution for orders, payments, service requests, or API queries
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Ticket</span>
        </button>
      </div>

      {/* Main Grid: Ticket List + Live Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="glass-panel p-4 rounded-3xl space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Your Tickets ({tickets.length})
          </span>

          <div className="space-y-2">
            {tickets.length > 0 ? (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    activeTicketId === t.id
                      ? "bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10"
                      : "bg-slate-900/60 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 font-mono">
                      #{t.id.slice(0, 6)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        t.status === "ANSWERED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white truncate">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{t.category}</span>
                    <span>{formatDate(t.updatedAt)}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                No tickets yet. Need help? Click 'Create New Ticket'.
              </div>
            )}
          </div>
        </div>

        {/* Live Conversation Pane */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col justify-between min-h-[480px]">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between space-y-6">
              {/* Ticket Top Meta */}
              <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Category: <b>{activeTicket.category}</b></span>
                    {activeTicket.orderId && <span>Order: <b>#{activeTicket.orderId}</b></span>}
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Status: {activeTicket.status}
                </span>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-96 pr-2">
                {activeTicket.messages.map((msg) => {
                  const isAdmin = msg.senderRole === "ADMIN";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                          isAdmin
                            ? "bg-gradient-to-br from-indigo-950/90 to-slate-900 border border-indigo-500/30 text-indigo-100"
                            : "bg-slate-800 text-white border border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-[11px] pb-1 border-b border-white/10">
                          {isAdmin ? (
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{isAdmin ? "Admin Support Representative" : "You"}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <div className="text-[10px] text-slate-400 text-right">
                          {formatDate(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="flex gap-3 pt-4 border-t border-white/10">
                <input
                  type="text"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..."
                  className="flex-1 glass-input px-4 py-2.5 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={loading || !replyMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <span>Select a ticket to view conversation or create a new one.</span>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-indigo-500/30">
            <h3 className="text-lg font-black text-white mb-4">Create New Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Order #12345 refill request"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  >
                    <option value="ORDER" className="bg-slate-900">Order Inquiry</option>
                    <option value="PAYMENT" className="bg-slate-900">Payment Issue</option>
                    <option value="SERVICE" className="bg-slate-900">Service Request</option>
                    <option value="API" className="bg-slate-900">Reseller API</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. clx89..."
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Message Description</label>
                <textarea
                  required
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full glass-input p-3.5 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 glow-btn text-white py-2.5 rounded-xl text-xs font-bold"
                >
                  {loading ? "Submitting..." : "Open Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
