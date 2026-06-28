"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity-logs?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Failed to load audit logs trail");
      const payload = await res.json();
      setLogs(payload.data || []);
      setPagination(payload.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Operational Audit Trail</h1>
        <p className="text-sm text-slate-400 mt-1">Audit log records of administrative mutations and requests</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800/80 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              <th className="p-4">Operational Action</th>
              <th className="p-4">Operator Agent</th>
              <th className="p-4">Metadata Context</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-500">
                  <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin inline-block" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-500 font-medium font-sans">
                  No activity logs logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/10 transition">
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-violet-950/40 border border-violet-900/20 text-violet-400 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 font-sans font-semibold">
                    {log.user?.name || "System Automated"}
                    <span className="block text-[10px] text-slate-500 font-normal font-sans mt-0.5">
                      {log.user?.email || "internal@system.cron"}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-sans leading-relaxed">
                    <div className="text-[10px]">
                      IP: <span className="text-slate-300 font-mono">{log.ipAddress || "127.0.0.1"}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                      Browser: {log.userAgent?.split(" ")[0] || "Unknown"}
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 font-sans">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-xs">
          <span className="text-slate-500 font-medium">
            Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
          </span>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevious}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={!pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
