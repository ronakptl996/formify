"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { FormInput, RefreshCw, ShieldAlert, CheckCircle2, Star, Send } from "lucide-react";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { FormField } from "@repo/database";

interface SubmitFormPageProps {
  params: Promise<{ id: string }>;
}

export default function SubmitForm({ params }: SubmitFormPageProps) {
  const { id: formId } = use(params);

  // 1. Fetch Form basic info
  const { data: form, isLoading } = trpc.form.getPublicForm.useQuery(
    { id: formId },
    {
      retry: false,
    }
  );

  // 2. Answers Local State
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});

  // Initialize defaults
  useEffect(() => {
    if (form) {
      const initialAnswers: Record<string, any> = {};
      form.fields.forEach((f) => {
        if (f.type === "checkbox") {
          initialAnswers[f.id] = false;
        } else {
          initialAnswers[f.id] = "";
        }
      });
      setAnswers(initialAnswers);
    }
  }, [form]);

  // 3. Submission Mutation
  const submitMutation = trpc.response.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Responses recorded successfully! Thank you!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit form responses.");
    },
  });

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers({ ...answers, [fieldId]: value });
    // Clear validation error on change
    if (validationErrors[fieldId]) {
      setValidationErrors({ ...validationErrors, [fieldId]: "" });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate fields locally first
    const errors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const value = answers[field.id];

      // Check required
      if (field.required && (value === undefined || value === null || value === "")) {
        errors[field.id] = `"${field.label}" is a required field.`;
      }

      // Check email format
      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors[field.id] = "Must enter a valid email address.";
        }
      }

      // Check number format
      if (field.type === "number" && value) {
        if (isNaN(Number(value))) {
          errors[field.id] = "Must enter a valid numerical digit.";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please resolve the highlighted validation errors before submitting.");
      return;
    }

    // Fire mutation
    submitMutation.mutate({
      formId: form.id,
      answers,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading dynamic questionnaire schema...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center gap-4">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h3 className="text-xl font-bold">Questionnaire Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          This form is either unpublished, does not exist, or has been taken down by the creator.
        </p>
        <Link href="/" className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  const { theme } = form;

  // Render Star Ratings questions
  const renderStarRating = (field: FormField) => {
    const value = answers[field.id] || 0;
    const hoverVal = hoverRating[field.id] || 0;

    return (
      <div className="flex gap-2.5 pt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange(field.id, star)}
            onMouseEnter={() => setHoverRating({ ...hoverRating, [field.id]: star })}
            onMouseLeave={() => setHoverRating({ ...hoverRating, [field.id]: 0 })}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverVal || value)
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                  : "text-slate-700 hover:text-slate-500"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-300 relative ${
      theme !== "default" ? `theme-${theme}` : "bg-slate-950 text-slate-100"
    }`}>
      {/* Background visual helpers */}
      {theme === "default" && (
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="max-w-xl w-full">
        {/* Core Submission Block */}
        <div className={`theme-card p-8 sm:p-10 rounded-3xl min-h-[450px] shadow-2xl relative flex flex-col justify-between overflow-hidden border ${
          theme === "default" ? "bg-slate-900/40 border-slate-900/80 backdrop-blur-md" : "border-border"
        }`}>
          
          {isSubmitted ? (
            // Immersive Custom completion card
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/5 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-extrabold tracking-tight">Submission Completed!</h3>
                <p className="text-sm opacity-80 max-w-sm mx-auto leading-relaxed">
                  Thank you! Your answers have been validated and successfully recorded in the creator&apos;s analytical dashboard sheet.
                </p>
              </div>
              
              {theme === "cyberpunk" && (
                <div className="text-[10px] font-mono text-emerald-400 border border-emerald-500 bg-emerald-500/5 px-4 py-2 mt-4 uppercase tracking-widest animate-pulse">
                  [✔] Merc Transaction Finalized [✔]
                </div>
              )}
              {theme === "anime_sunset" && (
                <div className="text-xs text-amber-300 font-semibold italic mt-4">
                  Safe travels under the cherry blossoms, fellow traveler... 🌸
                </div>
              )}
              {theme === "retro_mac" && (
                <div className="text-xs font-mono border-2 border-black p-3 bg-white shadow-[3px_3px_0_#000] mt-4">
                  File saved: DISK_SUBMISSION.DAT
                </div>
              )}
            </div>
          ) : (
            // Core Interactive form filling
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between h-full space-y-10">
              <div className="space-y-8">
                {/* Header Title Area */}
                <div className="space-y-3 text-left border-b border-slate-800/40 pb-5">
                  <h2 className="text-3xl font-extrabold tracking-tight">{form.title}</h2>
                  {form.description && (
                    <p className="text-sm opacity-80 leading-relaxed font-sans">{form.description}</p>
                  )}
                </div>

                {/* Form dynamic inputs mapping */}
                <div className="space-y-6 text-left">
                  {form.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="text-xs font-extrabold flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500 font-black">*</span>}
                      </label>

                      {/* Short text input */}
                      {field.type === "text" && (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || "Enter answer here..."}
                          value={answers[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full text-xs p-3.5 border outline-none font-sans"
                        />
                      )}

                      {/* Email input */}
                      {field.type === "email" && (
                        <input
                          type="email"
                          required={field.required}
                          placeholder={field.placeholder || "you@example.com"}
                          value={answers[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full text-xs p-3.5 border outline-none font-sans"
                        />
                      )}

                      {/* Number input */}
                      {field.type === "number" && (
                        <input
                          type="number"
                          required={field.required}
                          placeholder={field.placeholder || "e.g., 25"}
                          value={answers[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full text-xs p-3.5 border outline-none font-sans"
                        />
                      )}

                      {/* Dropdown options select */}
                      {field.type === "select" && (
                        <select
                          required={field.required}
                          value={answers[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full text-xs p-3.5 border outline-none font-sans bg-transparent cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">-- Choose Option --</option>
                          {field.options?.map((opt, idx) => (
                            <option key={idx} value={opt} className="bg-slate-900 text-slate-200">
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Checkbox input */}
                      {field.type === "checkbox" && (
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="checkbox"
                            checked={answers[field.id] || false}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            className="w-5 h-5 accent-indigo-500 cursor-pointer"
                          />
                          <span className="text-xs opacity-90 font-sans">Check this box to agree and confirm</span>
                        </div>
                      )}

                      {/* Rating stars questions */}
                      {field.type === "rating" && renderStarRating(field)}

                      {/* Date input */}
                      {field.type === "date" && (
                        <input
                          type="date"
                          required={field.required}
                          value={answers[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="w-full text-xs p-3.5 border outline-none font-sans cursor-pointer"
                        />
                      )}

                      {/* Validation Error warning labels */}
                      {validationErrors[field.id] && (
                        <p className="text-[10px] text-red-500 font-bold tracking-wide uppercase pt-1 animate-pulse">
                          {validationErrors[field.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="pt-10 flex items-center justify-between shrink-0">
                <span className="text-[9px] opacity-50 uppercase tracking-widest font-mono">
                  Rate limiting enabled
                </span>
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="theme-btn px-6 py-3.5 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {submitMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Submit Responses <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
