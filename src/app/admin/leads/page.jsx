"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, MessageSquare, UserPlus, Archive, Trash2, X, Plus } from "lucide-react";
import { LEAD_STATUS } from "../../../constants/status";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]); // Used for assignment dropdown
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [isArchived, setIsArchived] = useState(false);

  // Selected lead for note/assignment detail drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Fetch users for assignments
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/auth/me"); // Just fetch profile to confirm session or we can fetch a user directory. For now we use placeholder user selection.
        if (res.ok) {
          const payload = await res.json();
          setUsers([payload.data]); // For demonstration, we allow assigning to self
        }
      } catch (err) {
        console.error("Failed to load user catalog", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort,
        order,
        isArchived: isArchived ? "true" : "false",
      });

      if (search) query.append("search", search);
      if (status) query.append("status", status);

      const res = await fetch(`/api/admin/leads?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads list");

      const payload = await res.json();
      setLeads(payload.data || []);
      setPagination(payload.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sort, order, isArchived]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignChange = async (leadId, assigneeId) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId }),
      });
      if (!res.ok) throw new Error("Failed to assign lead");
      
      const assignedUser = users.find((u) => u.id === assigneeId) || null;
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, assignee: assignedUser } : l))
      );
      fetchLeads(); // Re-fetch to pull updated relationships
    } catch (err) {
      alert(err.message);
    }
  };

  const handleArchive = async (leadId, targetArchived) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: targetArchived }),
      });
      if (!res.ok) throw new Error("Failed to archive lead");
      
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setSelectedLead(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (leadId) => {
    if (!confirm("Are you sure you want to permanently delete this lead? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      setSelectedLead(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim() || submittingNote) return;
    setSubmittingNote(true);

    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });

      if (!res.ok) throw new Error("Failed to append note");

      const payload = await res.json();
      
      // Update drawer state
      setSelectedLead((prev) => ({
        ...prev,
        notes: [payload.data, ...(prev.notes || [])],
      }));
      setNoteContent("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingNote(false);
    }
  };

  const openDrawer = async (lead) => {
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`);
      if (res.ok) {
        const payload = await res.json();
        setSelectedLead(payload.data);
      }
    } catch (err) {
      setSelectedLead(lead);
    }
  };

  return (
    <div className="flex gap-6 h-full relative">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">CRM Leads Pipeline</h1>
            <p className="text-sm text-slate-400 mt-1">Review inquiries, assign agents, and monitor qualifiers</p>
          </div>
          <button
            onClick={() => setIsArchived(!isArchived)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition"
          >
            <Archive size={14} />
            <span>{isArchived ? "View Active Pipeline" : "View Archived Leads"}</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
            />
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
            >
              <option value="">All Statuses</option>
              {Object.values(LEAD_STATUS).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/80 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                <th className="p-4">Contact Info</th>
                <th className="p-4">Company</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4">Assignee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500">
                    <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-500 font-medium">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/10 transition">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{lead.name}</div>
                      <div className="text-slate-500 mt-0.5">{lead.email}</div>
                      <div className="text-slate-600 mt-0.5">{lead.phone || "No Phone"}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{lead.company || "—"}</td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2 py-1 text-[10px] font-bold rounded uppercase bg-slate-950 border border-slate-800 focus:outline-none ${
                          lead.status === "NEW" ? "text-violet-400" : "text-slate-300"
                        }`}
                      >
                        {Object.values(LEAD_STATUS).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.assigneeId || ""}
                        onChange={(e) => handleAssignChange(lead.id, e.target.value || null)}
                        className="px-2 py-1 text-[10px] bg-slate-950 border border-slate-800 text-slate-300 rounded focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openDrawer(lead)}
                          className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-800/40 rounded transition"
                          title="Open Details & Notes"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleArchive(lead.id, !isArchived)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/40 rounded transition"
                          title={isArchived ? "Restore to pipeline" : "Archive Lead"}
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/40 rounded transition"
                          title="Delete Permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center bg-slate-900/20 border border-slate-800/80 p-4 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">
              Page {pagination.page} of {pagination.pages} ({pagination.total} leads)
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

      {/* Note & Timeline Details Drawer */}
      {selectedLead && (
        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-10rem)] rounded-xl sticky top-8 overflow-hidden shadow-2xl">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-200 truncate">{selectedLead.name}</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{selectedLead.email}</p>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Timeline & Notes list */}
          <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Notes & Timeline
            </span>

            {/* Note add form */}
            <form onSubmit={handleAddNote} className="flex flex-col gap-2">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write note/timeline detail here..."
                required
                rows="3"
                className="w-full p-3 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition placeholder-slate-700 resize-none"
              />
              <button
                type="submit"
                disabled={submittingNote}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-violet-600 text-xs font-semibold hover:bg-violet-500 transition disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{submittingNote ? "Adding..." : "Add Note"}</span>
              </button>
            </form>

            <div className="border-t border-slate-800/80 my-2" />

            {/* Notes history list */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {!selectedLead.notes || selectedLead.notes.length === 0 ? (
                <div className="text-center text-[10px] text-slate-600 mt-6 italic">
                  No conversation notes logged for this lead.
                </div>
              ) : (
                selectedLead.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[11px] flex flex-col gap-1.5">
                    <div className="text-slate-400 leading-normal">{note.content}</div>
                    <div className="flex justify-between items-center text-[9px] text-slate-600 mt-1">
                      <span>By: {note.author?.name || "Agent"}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
