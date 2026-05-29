"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormInput, KeyRound, Sparkles, User, Mail, ShieldAlert } from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

export default function Auth() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome back, ${data.user.fullName}!`);
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Invalid credentials. Please try again.");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success(`Account created successfully! Welcome, ${data.user.fullName}!`);
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create account.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (authMode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      if (!fullName) {
        toast.error("Full name is required.");
        return;
      }
      registerMutation.mutate({ fullName, email, password });
    }
  };

  const triggerDemoLogin = () => {
    toast.loading("Signing in with pre-seeded demo creator credentials...");
    loginMutation.mutate({
      email: "admin@formify.com",
      password: "password123",
    });
    toast.dismiss();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center space-y-8 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FormInput className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Formify
          </span>
        </Link>

        {/* Card */}
        <div className="w-full p-8 rounded-3xl border border-slate-900 bg-slate-900/40 backdrop-blur-md shadow-2xl flex flex-col space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {authMode === "login" ? "Welcome Back Creator" : "Create Creator Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              {authMode === "login"
                ? "Enter your credentials or use the sandbox bypass"
                : "Fill out the fields to launch your custom dashboard"}
            </p>
          </div>

          {/* Quick Demo Bypass Card */}
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Demo Sandbox Bypasser
            </div>
            <p className="text-[11px] text-slate-400 leading-normal max-w-xs">
              Instantly log in as our pre-seeded creator superuser (<code className="text-slate-200">admin@formify.com</code>) to view forms, templates, mock analytics, and API credentials!
            </p>
            <button
              onClick={triggerDemoLogin}
              disabled={isLoading}
              type="button"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Sign In with Demo Credentials
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-900" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Or login manually</span>
            <div className="flex-1 border-t border-slate-900" />
          </div>

          {/* Core Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="Piyush Garg"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-950 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none transition-all placeholder-slate-605"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="admin@formify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-950 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none transition-all placeholder-slate-605"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Secret Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-950 border border-slate-900 rounded-xl focus:border-indigo-500 outline-none transition-all placeholder-slate-605"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              {isLoading
                ? "Authorizing..."
                : authMode === "login"
                ? "Enter Credentials"
                : "Create Creator Account"}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center text-xs text-slate-400">
            {authMode === "login" ? (
              <span>
                New creator?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-indigo-400 hover:underline cursor-pointer font-semibold"
                >
                  Create credentials
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-indigo-400 hover:underline cursor-pointer font-semibold"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>

        <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors">
          &larr; Back to Landing Page
        </Link>
      </div>
    </div>
  );
}
