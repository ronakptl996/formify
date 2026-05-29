"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FormInput,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Settings,
  Eye,
  LayoutTemplate,
  ToggleLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Sliders,
  Type,
  Mail,
  Binary,
  ListFilter,
  CheckSquare,
  Star,
  Calendar,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { FormField } from "@repo/database";

interface EditFormPageProps {
  params: Promise<{ id: string }>;
}

export default function EditForm({ params }: EditFormPageProps) {
  const router = useRouter();
  const { id: formId } = use(params);

  // 1. Fetch Form
  const { data: form, isLoading, refetch } = trpc.form.getById.useQuery({ id: formId });

  // 2. Local State mirroring DB fields for real-time preview
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "unlisted">("unlisted");
  const [theme, setTheme] = useState("default");
  const [fields, setFields] = useState<FormField[]>([]);

  // Sync state once form loads
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || "");
      setPublished(form.published);
      setVisibility(form.visibility as "public" | "unlisted");
      setTheme(form.theme);
      setFields(form.fields as FormField[]);
    }
  }, [form]);

  // 3. Update Mutation
  const updateFormMutation = trpc.form.update.useMutation({
    onSuccess: () => {
      toast.success("All changes successfully saved to database!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save form changes.");
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Form title cannot be empty.");
      return;
    }
    updateFormMutation.mutate({
      id: formId,
      title,
      description,
      published,
      visibility,
      theme,
      fields,
    });
  };

  // Add field to schema
  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: "field_" + Math.random().toString(36).substring(2, 9),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
    };

    if (type === "select") {
      newField.options = ["Option A", "Option B", "Option C"];
    } else if (type === "number") {
      newField.placeholder = "e.g., 25";
    } else if (type === "text") {
      newField.placeholder = "Enter response...";
    } else if (type === "email") {
      newField.placeholder = "you@example.com";
    }

    setFields([...fields, newField]);
    toast.success(`Added ${type} field to schema.`);
  };

  // Remove field
  const removeField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    toast.info("Field removed from schema.");
  };

  // Update field property
  const updateFieldProperty = (fieldId: string, property: keyof FormField, value: any) => {
    setFields(
      fields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, [property]: value };
        }
        return f;
      })
    );
  };

  // Update dropdown select options
  const updateSelectOptions = (fieldId: string, optionsString: string) => {
    const opts = optionsString.split(",").map((o) => o.trim()).filter(Boolean);
    updateFieldProperty(fieldId, "options", opts);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading form builder workspace...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold">Form not found or Access Denied</h3>
        <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Field icons dictionary
  const getFieldIcon = (type: FormField["type"]) => {
    switch (type) {
      case "text": return <Type className="w-4 h-4 text-indigo-400" />;
      case "email": return <Mail className="w-4 h-4 text-emerald-400" />;
      case "number": return <Binary className="w-4 h-4 text-purple-400" />;
      case "select": return <ListFilter className="w-4 h-4 text-amber-400" />;
      case "checkbox": return <CheckSquare className="w-4 h-4 text-teal-400" />;
      case "rating": return <Star className="w-4 h-4 text-pink-400" />;
      case "date": return <Calendar className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-900" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Form builder</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-bold text-slate-200 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none py-0.5 px-0 w-60"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {published && (
            <Link
              href={`/forms/${formId}/submit`}
              target="_blank"
              className="px-4 py-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Live Form <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={updateFormMutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {updateFormMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Schema Builder */}
        <aside className="w-96 border-r border-slate-900 flex flex-col h-full bg-slate-950 shrink-0">
          {/* Scrollable inputs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Form details */}
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Form Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give your form an optional custom description detailing instructions or guidelines..."
                className="w-full text-xs p-3 bg-slate-900/60 border border-slate-900 focus:border-indigo-500 outline-none rounded-xl resize-none h-20 transition-all text-slate-300 placeholder-slate-600 leading-normal"
              />
            </div>

            <div className="h-px bg-slate-900" />

            {/* Form fields lists */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Form Fields ({fields.length})</label>
              </div>

              {fields.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 leading-relaxed">
                  No fields added. Click buttons below to populate input parameters.
                </p>
              ) : (
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="border border-slate-900 bg-slate-900/10 p-4 rounded-2xl relative space-y-3 group hover:border-slate-800 transition-colors"
                    >
                      <button
                        onClick={() => removeField(field.id)}
                        className="absolute top-3.5 right-3.5 p-1 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {getFieldIcon(field.type)}
                        <span className="font-bold text-[10px] uppercase tracking-wider">{field.type} Field</span>
                      </div>

                      {/* Label Input */}
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)}
                        className="w-full text-xs bg-slate-900 border border-slate-900 focus:border-indigo-500 outline-none rounded-lg p-2 font-semibold"
                        placeholder="Field Question Label"
                      />

                      {/* Options input (only for select) */}
                      {field.type === "select" && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Select Options (comma-separated)</label>
                          <input
                            type="text"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) => updateSelectOptions(field.id, e.target.value)}
                            className="w-full text-[10px] bg-slate-900 border border-slate-900 focus:border-indigo-500 outline-none rounded-lg p-2 font-mono"
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}

                      {/* Placeholder (for text, email, number) */}
                      {["text", "email", "number"].includes(field.type) && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder || ""}
                            onChange={(e) => updateFieldProperty(field.id, "placeholder", e.target.value)}
                            className="w-full text-[10px] bg-slate-900 border border-slate-900 focus:border-indigo-500 outline-none rounded-lg p-2"
                            placeholder="e.g. Enter response..."
                          />
                        </div>
                      )}

                      {/* Required Toggle */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Required input</span>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateFieldProperty(field.id, "required", e.target.checked)}
                          className="w-4 h-4 accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Add Bottom Panel */}
          <div className="border-t border-slate-900 bg-slate-950 p-6 space-y-4 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-left block">Add Custom Field</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
              <button onClick={() => addField("text")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("text")} Short Text
              </button>
              <button onClick={() => addField("email")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("email")} Email
              </button>
              <button onClick={() => addField("number")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("number")} Number
              </button>
              <button onClick={() => addField("select")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("select")} Dropdown Select
              </button>
              <button onClick={() => addField("checkbox")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("checkbox")} Checkbox
              </button>
              <button onClick={() => addField("rating")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                {getFieldIcon("rating")} Stars Rating
              </button>
              <button onClick={() => addField("date")} className="flex items-center gap-1.5 p-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl transition-all cursor-pointer col-span-2 justify-center">
                {getFieldIcon("date")} Calendar Date Picker
              </button>
            </div>
          </div>
        </aside>

        {/* Center Panel: Live Render Canvas Preview */}
        <main className="flex-1 bg-slate-900/20 p-10 flex items-center justify-center overflow-y-auto h-full relative">
          <div className="absolute top-4 left-6 inline-flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest pointer-events-none">
            <Sliders className="w-3.5 h-3.5" /> Interactive Live Preview Canvas
          </div>

          <div className="max-w-xl w-full">
            {/* Themed Wrapper Container */}
            <div className={`theme-card p-8 rounded-3xl min-h-[400px] flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all ${
              theme !== "default" ? `theme-${theme}` : "bg-slate-950 border border-slate-900 text-slate-100"
            }`}>
              
              <div className="space-y-8">
                {/* Header */}
                <div className="space-y-2 text-left">
                  <h3 className="text-2xl font-bold tracking-tight">{title || "Form Title"}</h3>
                  {description && (
                    <p className="text-xs opacity-70 leading-relaxed font-sans">{description}</p>
                  )}
                </div>

                {/* Simulated Field Inputs Preview */}
                <div className="space-y-6 text-left">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-xs font-bold flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500 font-extrabold">*</span>}
                      </label>

                      {field.type === "text" && (
                        <input
                          type="text"
                          disabled
                          placeholder={field.placeholder || "Enter text..."}
                          className="w-full text-xs p-3 border outline-none font-sans"
                        />
                      )}

                      {field.type === "email" && (
                        <input
                          type="email"
                          disabled
                          placeholder={field.placeholder || "you@example.com"}
                          className="w-full text-xs p-3 border outline-none font-sans"
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          disabled
                          placeholder={field.placeholder || "e.g., 25"}
                          className="w-full text-xs p-3 border outline-none font-sans animate-fade-in"
                        />
                      )}

                      {field.type === "select" && (
                        <select disabled className="w-full text-xs p-3 border outline-none font-sans bg-transparent">
                          {field.options?.map((opt, idx) => (
                            <option key={idx}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === "checkbox" && (
                        <div className="flex items-center gap-2 pt-1">
                          <input type="checkbox" disabled className="w-4 h-4" />
                          <span className="text-xs opacity-80 font-sans">Check this box to agree</span>
                        </div>
                      )}

                      {field.type === "rating" && (
                        <div className="flex gap-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-5 h-5 fill-amber-500/10 text-amber-500" />
                          ))}
                        </div>
                      )}

                      {field.type === "date" && (
                        <input
                          type="date"
                          disabled
                          className="w-full text-xs p-3 border outline-none font-sans"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit trigger */}
              <div className="pt-8 text-right shrink-0">
                <button disabled className="theme-btn px-6 py-3 text-xs font-bold rounded-xl cursor-not-allowed">
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Column: Settings Panel */}
        <aside className="w-72 border-l border-slate-900 bg-slate-950 p-6 flex flex-col gap-8 h-full shrink-0 text-left overflow-y-auto">
          
          {/* Status & Visibility */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> Publishing Controls
            </span>

            {/* Published Switch */}
            <div className="flex items-center justify-between p-3 border border-slate-900 bg-slate-900/10 rounded-2xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200">Published Status</span>
                <p className="text-[9px] text-slate-500">Share form with respondents</p>
              </div>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Visibility Mode Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Visibility Mode</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-400">
                <button
                  onClick={() => setVisibility("unlisted")}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    visibility === "unlisted"
                      ? "border-pink-500/80 bg-pink-500/5 text-pink-400"
                      : "border-slate-900 bg-slate-900/10 hover:border-slate-800"
                  }`}
                >
                  Unlisted
                </button>
                <button
                  onClick={() => setVisibility("public")}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    visibility === "public"
                      ? "border-teal-500/80 bg-teal-500/5 text-teal-400"
                      : "border-slate-900 bg-slate-900/10 hover:border-slate-800"
                  }`}
                >
                  Public
                </button>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal pt-1">
                {visibility === "public"
                  ? "Public forms display proudly on the Explore templates sections. Anyone can discover it."
                  : "Unlisted forms are hidden from listings. Only accessible via secure direct link."}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-900" />

          {/* Theme Selector */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <LayoutTemplate className="w-3.5 h-3.5" /> Creative Themes
            </span>
            <div className="flex flex-col gap-2.5 text-xs font-bold text-slate-300">
              {[
                { id: "default", name: "Default Indigo", desc: "Clean, elegant and premium indigo layout" },
                { id: "cyberpunk", name: "Night Cyberpunk", desc: "Futuristic neon pink and cyan texturing" },
                { id: "anime_sunset", name: "Anime Sunset", desc: "Dreamy orange-purple warm gradient panels" },
                { id: "retro_mac", name: "Vintage Mac OS", desc: "Classic 90s greyscale beige retro grids" },
                { id: "startup_dark", name: "Startup Emerald", desc: "Obsidian dark carding with emerald accents" },
                { id: "synthwave", name: "80s Synthwave", desc: "Vibrant arcade grid with neon magenta buttons" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                    theme === t.id
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-400 shadow-md"
                      : "border-slate-900 bg-slate-900/15 hover:border-slate-800"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[9px] font-normal text-slate-500 leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
