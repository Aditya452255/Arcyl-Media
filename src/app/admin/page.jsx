"use client";

import { useEffect, useState } from "react";
import { Users, FileCode, MessageSquare, Eye, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) {
          throw new Error("Failed to load dashboard metrics");
        }
        const payload = await res.json();
        setData(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const { summary, recentLeads, recentContactSubmissions, recentActivity } = data || {};

  const cards = [
    {
      label: "Total Leads",
      value: summary?.totalLeads ?? 0,
      subtext: `${summary?.newLeads ?? 0} qualifying new`,
      color: "from-violet-600/25 to-violet-900/10 text-violet-400",
      icon: Users,
    },
    {
      label: "Contact Messages",
      value: summary?.contactMessages ?? 0,
      subtext: "Captured inboxes",
      color: "from-sky-600/25 to-sky-900/10 text-sky-400",
      icon: MessageSquare,
    },
    {
      label: "Active Projects",
      value: summary?.activeProjects ?? 0,
      subtext: `Total ${summary?.totalProjects ?? 0} items`,
      color: "from-emerald-600/25 to-emerald-900/10 text-emerald-400",
      icon: FileCode,
    },
    {
      label: "Website Views",
      value: summary?.websiteViews?.toLocaleString() ?? "0",
      subtext: "Growth analytics",
      color: "from-pink-600/25 to-pink-900/10 text-pink-400",
      icon: Eye,
    },
    {
      label: "Projected Revenue",
      value: `$${summary?.revenue?.toLocaleString() ?? "0"}`,
      subtext: "Placeholder index",
      color: "from-amber-600/25 to-amber-900/10 text-amber-400",
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome headline */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Performance Summary</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time metrics and operations ledger logs</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl hover:border-slate-700/80 transition duration-150 flex flex-col justify-between h-32 relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-[0.08] blur-xl`} />
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon size={20} className={card.color.split(" ").pop()} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{card.value}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">{card.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Lists and Ledgers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Leads & Submissions */}
        <div className="flex flex-col gap-8">
          {/* Recent Leads */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/10">
              <h2 className="text-sm font-bold text-slate-200">Recent CRM Leads</h2>
              <Link
                href="/admin/leads"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-800/50">
              {recentLeads?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No leads captured yet.</div>
              ) : (
                recentLeads?.map((lead) => (
                  <div key={lead.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{lead.name}</div>
                      <div className="text-slate-500 mt-0.5">{lead.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/10">
              <h2 className="text-sm font-bold text-slate-200">Recent Public Form Submissions</h2>
              <Link
                href="/admin/leads"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition"
              >
                <span>Manage</span>
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-800/50">
              {recentContactSubmissions?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No submissions captured yet.</div>
              ) : (
                recentContactSubmissions?.map((sub) => (
                  <div key={sub.id} className="p-4 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-300">{sub.lead?.name}</span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-400 font-medium">
                      Subject: <span className="text-slate-200">{sub.subject}</span>
                    </div>
                    <div className="text-slate-500 mt-1 line-clamp-1 italic">"{sub.message}"</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Audits & Activity logs */}
        <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/10">
            <h2 className="text-sm font-bold text-slate-200">Operational Audit Trail</h2>
            <Link
              href="/admin/activity-logs"
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 transition"
            >
              <span>View Logs</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/50 flex-1">
            {recentActivity?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No audit logs written yet.</div>
            ) : (
              recentActivity?.map((log) => (
                <div key={log.id} className="p-4 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-violet-400 font-semibold uppercase tracking-wider text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-300 font-medium leading-relaxed">
                    Triggered by: <span className="text-slate-100">{log.user?.name || "System"}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    IP: {log.ipAddress || "127.0.0.1"} | Browser: {log.userAgent?.split(" ")[0] || "Server"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
