"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, FormInput, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [checkoutSimulated, setCheckoutSimulated] = useState<string | null>(null);

  const proPrice = billingPeriod === "monthly" ? 29 : 19;
  const enterprisePrice = 199;

  const plans = [
    {
      name: "Free Sandbox",
      price: 0,
      description: "Perfect for testing the platform features and learning the builder flow.",
      features: [
        "Create up to 3 custom forms",
        "Dynamic schemas & Zod check",
        "Unlisted visibility mode",
        "Simulated Email Notification inbox",
        "Basic Analytics page",
      ],
      cta: "Try Free Now",
      color: "border-slate-800 bg-slate-900/20 hover:border-slate-700",
      icon: <Sparkles className="w-5 h-5 text-slate-400" />,
    },
    {
      name: "Pro Creator",
      price: proPrice,
      description: "Everything a scaling startup or professional creator needs to build campaigns.",
      features: [
        "Create UNLIMITED forms",
        "Public explore visibility mode",
        "Full suite of creative themes",
        "Simulated confirmations to respondents",
        "Deep Analytics with histograms",
        "Personal API Secret Key",
        "Scalar API documentation playground",
      ],
      cta: "Start 14-day Free Trial",
      color: "border-indigo-500/80 bg-indigo-500/5 hover:border-indigo-400 shadow-lg shadow-indigo-500/5",
      popular: true,
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
    },
    {
      name: "Enterprise",
      price: enterprisePrice,
      description: "For teams requiring customized spam-prevention, custom headers, and rate limits.",
      features: [
        "Everything in Pro Plan",
        "Custom IP Rate-limiting rules",
        "Dedicated database isolated backup",
        "Custom creative theme design support",
        "24/7 Priority support",
      ],
      cta: "Contact Enterprise",
      color: "border-slate-800 bg-slate-900/20 hover:border-slate-700",
      icon: <ShieldCheck className="w-5 h-5 text-pink-400" />,
    },
  ];

  const handleCheckout = (planName: string) => {
    if (planName === "Free Sandbox") {
      window.location.href = "/auth";
      return;
    }
    setCheckoutSimulated(planName);
  };

  const confirmSimulatedPurchase = () => {
    toast.success(`Simulated Transaction Approved! Welcome to ${checkoutSimulated} Pro tier! 🚀`);
    setCheckoutSimulated(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FormInput className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Formify</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col items-center relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Flexible Plans for Every Creator
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mb-10 leading-relaxed">
          Start for free, experiment with sandboxed creative themes, and upgrade as your responses volume and analytics scale.
        </p>

        {/* Period Switcher */}
        <div className="inline-flex items-center p-1 border border-slate-900 bg-slate-900/60 rounded-xl mb-16">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              billingPeriod === "monthly" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bill Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("annually")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingPeriod === "annually" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Bill Annually
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-semibold tracking-wide uppercase">
              Save 30%
            </span>
          </button>
        </div>

        {/* Pricing Grids */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left items-stretch mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-3xl border flex flex-col relative transition-all ${plan.color} ${
                plan.popular ? "scale-100 md:scale-[1.03] ring-1 ring-indigo-500" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                  Most Popular
                </span>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold tracking-wide text-slate-400 uppercase">{plan.name}</span>
                {plan.icon}
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-extrabold">${plan.price}</span>
                <span className="text-xs text-slate-500">/{billingPeriod === "annually" && plan.price !== 199 ? "yr" : "mo"}</span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-6 border-b border-slate-900/60 pb-6">{plan.description}</p>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.name)}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold tracking-wide transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-600/10 hover:opacity-95"
                    : "bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850"
                }`}
              >
                {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Simulated Checkout Modal */}
      {checkoutSimulated && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl relative shadow-2xl space-y-6">
            <h3 className="text-2xl font-bold text-center">Simulated Stripe Checkout</h3>
            <p className="text-slate-400 text-xs text-center leading-relaxed">
              You are simulating a checkout pipeline for the <strong className="text-indigo-400 font-bold">{checkoutSimulated}</strong> tier using standard test environments. No actual funds are processed!
            </p>

            <div className="border border-slate-800 bg-slate-950 p-4 rounded-xl space-y-3 text-xs text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="text-slate-200">admin@formify.com</span>
              </div>
              <div className="flex justify-between">
                <span>Tier level:</span>
                <span className="text-indigo-400 font-bold">{checkoutSimulated}</span>
              </div>
              <div className="flex justify-between">
                <span>Test Card Number:</span>
                <span className="text-slate-200">4242 •••• •••• 4242</span>
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-3">
                <span className="font-bold text-slate-300">Total charge:</span>
                <span className="text-emerald-400 font-extrabold">${checkoutSimulated === "Pro Creator" ? proPrice : enterprisePrice}.00</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCheckoutSimulated(null)}
                className="flex-1 py-3 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-850 cursor-pointer"
              >
                Cancel Transaction
              </button>
              <button
                onClick={confirmSimulatedPurchase}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-emerald-500/10 hover:opacity-95 cursor-pointer"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
