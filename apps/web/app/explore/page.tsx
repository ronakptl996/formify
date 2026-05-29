"use client";

import React from "react";
import Link from "next/link";
import { Compass, FormInput, ArrowLeft, ArrowRight, Layers, Sparkles, Star } from "lucide-react";
import { trpc } from "~/trpc/client";

export default function Explore() {
  // Query all public published forms
  const { data: publicForms, isLoading } = trpc.form.listPublicForms.useQuery();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FormInput className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Formify</span>
        </Link>
        <Link href="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col items-center relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-semibold tracking-wide uppercase mb-6">
          <Compass className="w-3.5 h-3.5" /> Public Discover Showcase
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Explore Creative Form Templates
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mb-16 leading-relaxed">
          Test interactive public questionnaires built by our sandbox creator community. Check validated fields and dynamic sunset/cyberpunk animations!
        </p>

        {/* Templates Deck */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
            <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Fetching discover templates...</span>
          </div>
        ) : !publicForms || publicForms.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs border border-dashed border-slate-900 bg-slate-900/10 p-8 rounded-3xl max-w-sm">
            No public templates currently published. Try creating a custom form in your sandbox dashboard and set the visibility to &quot;Public&quot;!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl text-left">
            {publicForms.map((form) => (
              <div
                key={form.id}
                className="border border-slate-900 bg-slate-900/20 hover:border-slate-800 p-6 rounded-3xl flex flex-col justify-between group transition-all hover:-translate-y-0.5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      {form.theme} theme
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {form.fieldsCount} Inputs
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-1">
                      {form.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {form.description || "A public questionnaire ready for submission responses."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-900/60 pt-6 mt-6">
                  <Link
                    href={`/forms/${form.id}/submit`}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Questionnaire <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
