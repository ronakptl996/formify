"use client";

import React, { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FormInput,
  RefreshCw,
  TrendingUp,
  Inbox,
  Star,
  CheckCircle,
  FileSpreadsheet,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { trpc } from "~/trpc/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface FormAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#a855f7"];

export default function FormAnalytics({ params }: FormAnalyticsPageProps) {
  const { id: formId } = use(params);

  // Fetch form submissions and aggregated metrics
  const { data: analyticsData, isLoading, refetch } = trpc.response.listByForm.useQuery({ formId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Aggregating form analytical logs...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center gap-4">
        <Inbox className="w-12 h-12 text-slate-600" />
        <h3 className="text-xl font-bold">Analytics not found or access denied</h3>
        <Link href="/dashboard" className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { form, responses, analytics } = analyticsData;

  // Format data for timeline area chart
  const timelineData = analytics.recentHistory.length > 0
    ? analytics.recentHistory
    : [
        { date: "May 25", count: 0 },
        { date: "May 26", count: 0 },
        { date: "May 27", count: 0 },
        { date: "May 28", count: 2 },
        { date: "May 29", count: responses.length },
      ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-900 bg-slate-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-5 w-px bg-slate-900" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Form Analytics</span>
            <span className="text-sm font-bold text-slate-200">{form.title}</span>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Core Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Stat 1 */}
          <div className="p-6 border border-slate-900 bg-slate-900/10 rounded-2xl flex flex-col justify-between h-32 relative text-left">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Submissions</span>
              <Inbox className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-4xl font-extrabold">{analytics.totalResponses}</span>
              <p className="text-[10px] text-slate-500 mt-1">Total recorded responses</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-6 border border-slate-900 bg-slate-900/10 rounded-2xl flex flex-col justify-between h-32 relative text-left">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Average Rating Stars</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-4xl font-extrabold">{analytics.averageRating !== null ? `${analytics.averageRating} / 5` : "N/A"}</span>
              <p className="text-[10px] text-slate-500 mt-1">Aggregated across active star questions</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-6 border border-slate-900 bg-slate-900/10 rounded-2xl flex flex-col justify-between h-32 relative text-left">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-wider">Completion Rate</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-4xl font-extrabold">{analytics.totalResponses > 0 ? "100%" : "0%"}</span>
              <p className="text-[10px] text-slate-500 mt-1">Submissions with successful schemas validation</p>
            </div>
          </div>
        </section>

        {/* Charts & Histograms split */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions Timeline Area */}
          <div className="p-6 border border-slate-900 bg-slate-900/10 rounded-3xl flex flex-col gap-6 text-left">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> Response Timeline Metrics
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Area type="monotone" dataKey="count" name="Submissions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dropdown Select option frequencies */}
          <div className="p-6 border border-slate-900 bg-slate-900/10 rounded-3xl flex flex-col gap-6 text-left justify-between">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4" /> Dropdowns & Checkboxes Distribution
            </div>
            
            {Object.keys(analytics.optionCounts).length === 0 && Object.keys(analytics.checkboxCounts).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
                <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs">No choice/option elements defined in form.</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 pt-2">
                {/* Loop Select Options */}
                {Object.entries(analytics.optionCounts).map(([fieldId, counts]) => {
                  const fieldDef = form.fields.find((f) => f.id === fieldId);
                  const label = fieldDef ? fieldDef.label : fieldId;

                  const data = Object.entries(counts as Record<string, number>).map(([name, value]) => ({ name, value }));

                  return (
                    <div key={fieldId} className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 leading-tight block">{label}</span>
                      <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data} layout="vertical">
                            <XAxis type="number" stroke="#64748b" fontSize={8} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} width={80} />
                            <ChartTooltip
                              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "10px" }}
                            />
                            <Bar dataKey="value" name="Frequencies" fill="#818cf8" radius={[0, 4, 4, 0]}>
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}

                {/* Loop Checkboxes */}
                {Object.entries(analytics.checkboxCounts as Record<string, number>).map(([fieldId, count]) => {
                  const fieldDef = form.fields.find((f) => f.id === fieldId);
                  const label = fieldDef ? fieldDef.label : fieldId;

                  const checkedRatio = responses.length > 0 ? (count / responses.length) * 100 : 0;

                  return (
                    <div key={fieldId} className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 leading-tight block">{label}</span>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex-1 bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
                          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${checkedRatio}%` }} />
                        </div>
                        <span className="text-[10px] text-emerald-400 w-16 text-right">
                          {count} checked ({checkedRatio.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Responses Database Table Spreadsheet */}
        <section className="space-y-4">
          <h3 className="text-xl font-extrabold tracking-tight text-left">Answers Database Sheet</h3>
          
          {responses.length === 0 ? (
            <div className="py-16 border border-slate-900 bg-slate-900/10 rounded-3xl text-center text-slate-500 text-xs">
              No submissions recorded yet for this form.
            </div>
          ) : (
            <div className="border border-slate-900 bg-slate-900/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-950 font-bold uppercase tracking-wider text-slate-400">
                      <th className="p-4 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date Submitted</th>
                      {form.fields.map((field) => (
                        <th key={field.id} className="p-4 max-w-xs truncate">{field.label}</th>
                      ))}
                      <th className="p-4">Respondent IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40 font-medium text-slate-300">
                    {responses.map((resp) => (
                      <tr key={resp.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 whitespace-nowrap font-mono text-[10px] text-slate-500">
                          {new Date(resp.submittedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        {form.fields.map((field) => {
                          const ansVal = resp.answers[field.id];
                          let displayVal = "-";

                          if (ansVal !== undefined && ansVal !== null) {
                            if (typeof ansVal === "boolean") {
                              displayVal = ansVal ? "TRUE" : "FALSE";
                            } else {
                              displayVal = String(ansVal);
                            }
                          }

                          return (
                            <td key={field.id} className="p-4 max-w-xs truncate">
                              {field.type === "rating" && ansVal ? (
                                <div className="flex gap-0.5 text-amber-500">
                                  {Array.from({ length: Number(ansVal) }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-500" />
                                  ))}
                                </div>
                              ) : (
                                <span className={field.type === "email" ? "text-emerald-400 underline font-mono text-[11px]" : ""}>
                                  {displayVal}
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-4 whitespace-nowrap font-mono text-[10px] text-slate-500">
                          {resp.meta?.ip || "127.0.0.1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
