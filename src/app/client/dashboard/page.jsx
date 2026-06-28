"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, FileCheck, FolderOpen, Calendar, AlertCircle, ArrowRight, Download, FileText, ImageIcon } from "lucide-react";

export default function ClientDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/client/dashboard");
        if (!res.ok) throw new Error("Failed to load client portal dashboard metrics");
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

  const { client, summary, unreadMessagesCount, upcomingDeadlines, recentFiles, pendingDeliverables } = data || {};

  const cards = [
    {
      label: "Active Projects",
      value: summary?.activeProjects ?? 0,
      subtext: "Ongoing client tasks",
      color: "from-violet-600/25 to-violet-900/10 text-violet-400",
      icon: FolderKanban,
    },
    {
      label: "Completed Projects",
      value: summary?.completedProjects ?? 0,
      subtext: "Delivered items archive",
      color: "from-emerald-600/25 to-emerald-900/10 text-emerald-400",
      icon: FileCheck,
    },
    {
      label: "Pending Deliverables",
      value: summary?.pendingDeliverablesCount ?? 0,
      subtext: "Awaiting client review",
      color: "from-amber-600/25 to-amber-900/10 text-amber-400",
      icon: AlertCircle,
    },
    {
      label: "Shared Files",
      value: summary?.sharedFilesCount ?? 0,
      subtext: "Shared files library",
      color: "from-sky-600/25 to-sky-900/10 text-sky-400",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="flex flex-col gap-8 text-slate-100">
      {/* Welcome banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900/40 to-slate-950 border border-slate-800 rounded-2xl">
        <h1 className="text-2xl font-bold">Welcome back, from {client?.companyName}!</h1>
        <p className="text-sm text-slate-400 mt-1">Here is a real-time summary of active developments and shared workspace assets.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="p-6 bg-slate-900/25 border border-slate-850 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden"
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  {card.label}
                </span>
                <h2 className="text-3xl font-bold mt-2 text-slate-100">{card.value}</h2>
                <p className="text-xs text-slate-450 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main dashboard listing views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deliverables Section */}
        <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              <h3 className="font-semibold text-slate-200">Awaiting Client Approval</h3>
            </div>
            <Link
              href="/client/projects"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
            >
              <span>Go to Workspace</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {pendingDeliverables?.length === 0 ? (
            <p className="text-slate-500 text-xs py-6 text-center">No deliverables awaiting review.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingDeliverables?.map((del) => (
                <div
                  key={del.id}
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{del.title}</h4>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">Version {del.version}</span>
                  </div>
                  {del.fileUrl && (
                    <a
                      href={del.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-350"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deadlines Section */}
        <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar size={18} className="text-violet-400" />
            <h3 className="font-semibold text-slate-200">Upcoming Project Deadlines</h3>
          </div>

          {upcomingDeadlines?.length === 0 ? (
            <p className="text-slate-500 text-xs py-6 text-center">No upcoming deadlines registered.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingDeadlines?.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <h4 className="text-xs font-semibold text-slate-200">{proj.name}</h4>
                  <span className="text-[10px] text-violet-400 bg-violet-950/40 border border-violet-900/20 px-2 py-0.5 rounded font-mono">
                    {new Date(proj.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shared Files Section */}
        <div className="p-6 bg-slate-900/20 border border-slate-850 rounded-xl flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen size={18} className="text-sky-400" />
              <h3 className="font-semibold text-slate-200">Recent Shared Documents</h3>
            </div>
          </div>

          {recentFiles?.length === 0 ? (
            <p className="text-slate-500 text-xs py-6 text-center">No files shared yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFiles?.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {file.mediaAsset?.fileType === "image" ? (
                      <ImageIcon className="text-slate-500" size={18} />
                    ) : (
                      <FileText className="text-slate-500" size={18} />
                    )}
                    <span className="text-xs text-slate-250 truncate max-w-[200px]">
                      {file.mediaAsset?.altText || "Document File"}
                    </span>
                  </div>
                  <a
                    href={file.mediaAsset?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
