"use client";

import Link from "next/link";
import { ArrowRight, FormInput, Sparkles, Shield, BarChart3, Mail, Layers, Compass } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FormInput className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Formify
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="/explore" className="hover:text-white transition-colors flex items-center gap-1">
            <Compass className="w-4 h-4" /> Explore Gallery
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            API Reference
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm font-medium hover:text-white text-slate-400 transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            Create Sandbox Form
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-20 pb-24 flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation Form Building SaaS
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-8">
          Build Forms in{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Creative Style
          </span>
          , Collect Responses Beautifully
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Create type-safe dynamic forms with advanced validation, choose premium styled themes (Cyberpunk, Retro Mac, Sunset), share instant links, and view rich dashboard metrics.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
          <Link
            href="/auth"
            className="group px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl hover:opacity-95 shadow-xl shadow-indigo-500/20 transition-all flex items-center gap-2 hover:gap-3 active:scale-95"
          >
            Try Creator Sandbox <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/explore"
            className="px-8 py-4 text-base font-semibold text-slate-300 border border-slate-800 bg-slate-900/50 hover:bg-slate-900 rounded-2xl transition-all active:scale-95"
          >
            View Explore Gallery
          </Link>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left mt-10">
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm shadow-sm hover:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Dynamic Custom Fields</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Add text, email, number, select dropdowns, checkboxes, ratings, and dates. Configure constraints, required toggles, and placeholders on the fly.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm shadow-sm hover:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">5+ Premium Creative Themes</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly customize forms with immersive film, anime sunset, terminal cyberpunk, or 90s vintage operating system stylings with micro-animations.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm shadow-sm hover:border-slate-800 transition-colors">
            <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 mb-6 shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Rich Aggregate Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analyze results in real time with automated histograms, interactive averages, timeline trend charts, and raw tables downloadable or queried via API.
            </p>
          </div>
        </section>

        {/* Sub-features / Proof */}
        <section className="mt-32 w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-snug">
              Public and Unlisted Visibility Options
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Choose how you want to share your forms. **Public Forms** display proudly in explore libraries and templates galleries. **Unlisted Forms** generate secure, obscure paths readable only by direct link sharing.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-md flex items-center justify-center mt-1">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Rate Limiting & Spam Protection</h4>
                  <p className="text-xs text-slate-400">Public endpoints validate client IPs dynamically to block flood submissions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md flex items-center justify-center mt-1">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">Simulated Creator & Respondent Email Flows</h4>
                  <p className="text-xs text-slate-400">Receive alerts in a visually rich Simulated Email Inbox upon form submissions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <span className="text-xs font-semibold text-slate-500">Night City Cyberpunk Survey (Preview)</span>
              </div>
              <div className="space-y-4 font-mono text-xs text-emerald-400 bg-black/60 p-4 rounded-xl border border-slate-950">
                <p>&gt; Loading Street Merc questionnaire...</p>
                <p className="text-pink-500 font-bold">[!] Field Validation Active</p>
                <div className="border border-slate-850 p-3 bg-slate-950/80 rounded space-y-2">
                  <p className="text-slate-400">What is your Lifepath? *</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 border border-slate-800 text-slate-400 rounded">Nomad</span>
                    <span className="px-2 py-0.5 border border-pink-500 text-pink-500 rounded bg-pink-500/10">Street Kid</span>
                    <span className="px-2 py-0.5 border border-slate-800 text-slate-400 rounded">Corpo</span>
                  </div>
                </div>
                <p>&gt; Submitting answers to secure api...</p>
                <p className="text-teal-400 font-semibold">[✓] Responses successfully captured!</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8 max-w-7xl mx-auto w-full text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4 mt-20">
        <span>© 2026 Formify SaaS Inc. Created with Turborepo, tRPC, Zod, and Drizzle ORM.</span>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-slate-400">Pricing</Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">Scalar API Documentation</a>
        </div>
      </footer>
    </div>
  );
}
