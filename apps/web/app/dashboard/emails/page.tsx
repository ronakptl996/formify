"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FormInput,
  Mail,
  RefreshCw,
  MailOpen,
  Calendar,
  Send,
  User,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { trpc } from "~/trpc/client";

interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string | Date;
  type: string;
}

export default function EmailsInbox() {
  const router = useRouter();
  const [activeEmail, setActiveEmail] = useState<SimulatedEmail | null>(null);

  // 1. Fetch user to ensure auth
  const { data: user, isLoading: isAuthLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth");
    }
  }, [user, isAuthLoading, router]);

  // 2. Fetch simulated emails
  const { data: emails, isLoading: isEmailsLoading, refetch } = trpc.email.listSimulatedEmails.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Auto-select first email when loaded
  useEffect(() => {
    if (emails && emails.length > 0 && !activeEmail) {
      setActiveEmail(emails[0] as SimulatedEmail);
    }
  }, [emails, activeEmail]);

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading mailbox server credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Header Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-900" />
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold tracking-tight">Simulated Developer Email Console</h2>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Mailbox splitscreen layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Inbox List */}
        <aside className="w-96 border-r border-slate-900 flex flex-col h-full bg-slate-950/40 shrink-0 overflow-y-auto divide-y divide-slate-900/60">
          <div className="p-4 bg-slate-950/20 shrink-0 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inbox Logs ({emails?.length || 0})</span>
          </div>

          {isEmailsLoading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Fetching logs...</span>
            </div>
          ) : !emails || emails.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-xs px-6 flex flex-col items-center gap-3">
              <Inbox className="w-10 h-10 text-slate-700" />
              <div className="space-y-1">
                <span className="font-semibold block text-slate-400">Inbox empty</span>
                <p className="text-[10px] leading-relaxed text-slate-600">
                  Submissions alerts will display visual email logs here. Submit responses on public forms to receive alerts!
                </p>
              </div>
            </div>
          ) : (
            emails.map((email) => {
              const isActive = activeEmail?.id === email.id;
              const dateStr = new Date(email.sentAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <button
                  key={email.id}
                  onClick={() => setActiveEmail(email as SimulatedEmail)}
                  className={`w-full p-5 text-left flex flex-col gap-2 transition-colors cursor-pointer border-l-2 ${
                    isActive
                      ? "bg-slate-900/30 border-indigo-500"
                      : "border-transparent hover:bg-slate-900/10"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1"><User className="w-3 h-3 text-indigo-400" /> {email.to}</span>
                    <span className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3" /> {dateStr}</span>
                  </div>
                  <h4 className={`text-xs font-bold leading-normal truncate ${isActive ? "text-indigo-400" : "text-slate-200"}`}>
                    {email.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                    {email.body}
                  </p>
                </button>
              );
            })
          )}
        </aside>

        {/* Right Column: Email Body Reader */}
        <main className="flex-1 bg-slate-900/10 p-8 flex flex-col overflow-y-auto h-full text-left">
          {activeEmail ? (
            <div className="max-w-2xl w-full bg-slate-950 border border-slate-900 p-8 rounded-3xl shadow-xl flex flex-col gap-6 animate-fade-in self-center">
              
              {/* Mail Headers */}
              <div className="space-y-4 border-b border-slate-900 pb-6 shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-xl font-bold tracking-tight text-slate-200 leading-snug">{activeEmail.subject}</h3>
                  <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase tracking-wider rounded-md">
                    {activeEmail.type.replace("_", " ")}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 text-xs text-slate-400 gap-2 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 font-semibold uppercase tracking-wider text-[9px] w-12 block">Recipient:</span>
                    <span className="text-slate-300 font-bold select-all">{activeEmail.to}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-slate-600 font-semibold uppercase tracking-wider text-[9px]">Timestamp:</span>
                    <span className="text-slate-300 font-bold">
                      {new Date(activeEmail.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mail Body Message */}
              <div className="flex-1 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans min-h-[250px]">
                {activeEmail.body}
              </div>

              <div className="border-t border-slate-900 pt-6 text-[10px] text-slate-600 font-semibold flex items-center justify-between shrink-0">
                <span>Formify Email Dispatch Server (Simulated)</span>
                <span className="font-mono text-[9px] bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                  ID: {activeEmail.id}
                </span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 self-center">
              <MailOpen className="w-8 h-8 text-slate-700 animate-pulse" />
              <span className="text-xs">Select email item log from left panel to read contents.</span>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
