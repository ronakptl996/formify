"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FormInput,
  Plus,
  BarChart3,
  ExternalLink,
  Trash2,
  Edit,
  Mail,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Compass,
  Code,
  Eye,
  Key,
} from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState(false);

  // 1. Fetch Auth State
  const { data: user, isLoading: isAuthLoading, refetch: refetchUser } = trpc.auth.me.useQuery();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/auth");
    }
  }, [user, isAuthLoading, router]);

  // 2. Fetch Forms list
  const { data: forms, isLoading: isFormsLoading, refetch: refetchForms } = trpc.form.listCreatorForms.useQuery(
    undefined,
    { enabled: !!user }
  );

  // 3. Mutations
  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (newForm) => {
      toast.success(`Form "${newForm.title}" created successfully!`);
      router.push(`/forms/${newForm.id}/edit`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create form.");
    },
  });

  const deleteFormMutation = trpc.form.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully.");
      refetchForms();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form.");
    },
  });

  const regenerateApiKeyMutation = trpc.auth.regenerateApiKey.useMutation({
    onSuccess: (data) => {
      toast.success("Developer API Key successfully regenerated!");
      refetchUser();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to regenerate API Key.");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully.");
      router.push("/");
    },
  });

  const handleCreateForm = () => {
    createFormMutation.mutate({
      title: "Untilted Creative Questionnaire",
      description: "Let's capture some awesome data points.",
    });
  };

  const handleDeleteForm = (id: string, title: string) => {
    if (confirm(`Are you absolutely sure you want to delete form "${title}" and all its recorded responses?`)) {
      deleteFormMutation.mutate({ id });
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success("API Key copied to clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateApiKey = () => {
    if (confirm("Warning: Regenerating your API key will immediately invalidate your old key. Do you wish to proceed?")) {
      regenerateApiKeyMutation.mutate();
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Verifying security token credentials...</p>
        </div>
      </div>
    );
  }

  // Compute overall summary stats
  const totalFormsCount = forms?.length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FormInput className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Formify</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/explore" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <Compass className="w-4 h-4" /> Explore Gallery
          </Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <Code className="w-4 h-4" /> Interactive API Docs
          </a>
          <Link href="/dashboard/emails" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors relative">
            <Mail className="w-4 h-4" /> Simulated Inbox
          </Link>

          <div className="h-5 w-px bg-slate-900" />

          {/* User profile */}
          <div className="flex items-center gap-3">
            <img src={user.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} alt={user.fullName} className="w-8 h-8 rounded-full border border-slate-800" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-200">{user.fullName}</span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <button onClick={() => logoutMutation.mutate()} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900/50 rounded-xl transition-all cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-10">
        
        {/* Header Hero Area */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/10 border border-slate-900 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Creator Dashboard</h2>
            <p className="text-sm text-slate-400">Configure validations, choose immersive creative themes, and explore response logs.</p>
          </div>
          <button
            onClick={handleCreateForm}
            disabled={createFormMutation.isPending}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-2xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create Premium Form
          </button>
        </section>

        {/* Developer API Key Console */}
        {user.apiKey && (
          <section className="border border-slate-900 bg-slate-900/30 backdrop-blur-sm p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl text-left">
              <div className="flex items-center gap-1 text-xs text-indigo-400 font-bold uppercase tracking-wider">
                <Key className="w-4 h-4" /> Developer Secret Token
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Use your secret API Key to query form results from third-party tools, or pass it into our **Scalar API Sandbox** header parameter for live integrations.
              </p>
            </div>
            
            <div className="flex w-full md:w-auto items-center gap-3 bg-slate-950 border border-slate-900 px-4 py-2.5 rounded-2xl">
              <code className="text-xs text-emerald-400 font-mono select-all">
                {user.apiKey}
              </code>
              <button
                onClick={() => copyApiKey(user.apiKey!)}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRegenerateApiKey}
                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* Forms Catalog */}
        <section className="space-y-6">
          <h3 className="text-xl font-extrabold tracking-tight">Active Forms Catalog ({totalFormsCount})</h3>

          {isFormsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
              <span className="text-xs">Loading form templates...</span>
            </div>
          ) : !forms || forms.length === 0 ? (
            <div className="py-24 border border-dashed border-slate-900 bg-slate-900/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 gap-4">
              <FormInput className="w-12 h-12 text-slate-600" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-300">No forms found</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Start by creating your first dynamic sandbox form, configuring validations, and choosing an awesome creative theme!
                </p>
              </div>
              <button
                onClick={handleCreateForm}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-850 cursor-pointer"
              >
                Create Blank Form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="group border border-slate-900 bg-slate-900/20 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between transition-all hover:-translate-y-0.5"
                >
                  <div className="space-y-4">
                    {/* Header tags */}
                    <div className="flex items-center justify-between">
                      {/* Theme Badge */}
                      <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                        {form.theme}
                      </span>
                      {/* Visibility Badge */}
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded-md ${
                          form.published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}>
                          {form.published ? "Published" : "Draft"}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border rounded-md ${
                          form.visibility === "public" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        }`}>
                          {form.visibility}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5 text-left">
                      <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {form.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {form.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="border-t border-slate-900/60 pt-6 mt-6 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold">
                      {form.fields.length} Custom Fields
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Live Link */}
                      {form.published ? (
                        <Link
                          href={`/forms/${form.id}/submit`}
                          target="_blank"
                          className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-900/50 rounded-xl transition-all"
                          title="Open Live Public Form"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="p-2 text-slate-700 cursor-not-allowed"
                          title="Publish form to preview live link"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Builder */}
                      <Link
                        href={`/forms/${form.id}/edit`}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-900/50 rounded-xl transition-all"
                        title="Edit form fields & themes"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {/* Analytics Dashboard */}
                      <Link
                        href={`/forms/${form.id}/analytics`}
                        className="p-2 text-slate-500 hover:text-purple-400 hover:bg-slate-900/50 rounded-xl transition-all"
                        title="View aggregate results analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>

                      {/* Delete Form */}
                      <button
                        onClick={() => handleDeleteForm(form.id, form.title)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900/50 rounded-xl transition-all cursor-pointer"
                        title="Delete form permanent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
