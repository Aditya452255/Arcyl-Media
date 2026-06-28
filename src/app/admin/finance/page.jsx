"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Plus,
  Send,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  BadgeAlert,
  FolderLock,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function FinanceBillingPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats data
  const [stats, setStats] = useState(null);

  // Business items lists
  const [quotes, setQuotes] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // Create form states
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Quote Form
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteServices, setQuoteServices] = useState(""); // JSON or comma-separated items
  const [quoteCost, setQuoteCost] = useState("");
  const [quoteExpiry, setQuoteExpiry] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");

  // Proposal Form
  const [propClient, setPropClient] = useState("");
  const [propProject, setPropProject] = useState("");
  const [propTitle, setPropTitle] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propTax, setPropTax] = useState("0");
  const [propDiscount, setPropDiscount] = useState("0");
  const [propExpiry, setPropExpiry] = useState("");
  const [propScope, setPropScope] = useState("");

  // Invoice Form
  const [invClient, setInvClient] = useState("");
  const [invProject, setInvProject] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invTax, setInvTax] = useState("0");
  const [invDiscount, setInvDiscount] = useState("0");
  const [invDue, setInvDue] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/business/dashboard");
      if (res.ok) {
        const payload = await res.json();
        setStats(payload.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/business/quotes");
      if (res.ok) {
        const payload = await res.json();
        setQuotes(payload.data.list || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchProposals = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/business/proposals");
      if (res.ok) {
        const payload = await res.json();
        setProposals(payload.data.list || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/business/invoices");
      if (res.ok) {
        const payload = await res.json();
        setInvoices(payload.data.list || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchClientsAndProjects = useCallback(async () => {
    try {
      const cRes = await fetch("/api/admin/cms/clients"); // Standard clients API
      if (cRes.ok) {
        const payload = await cRes.json();
        setClients(payload.data || []);
      }
      const pRes = await fetch("/api/public/cms/projects"); // Projects fallback
      if (pRes.ok) {
        const payload = await pRes.json();
        setProjects(payload.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchClientsAndProjects();
  }, [fetchStats, fetchClientsAndProjects]);

  useEffect(() => {
    if (activeTab === "quotes") fetchQuotes();
    if (activeTab === "proposals") fetchProposals();
    if (activeTab === "invoices") fetchInvoices();
  }, [activeTab, fetchQuotes, fetchProposals, fetchInvoices]);

  // Submissions handler
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      let parsedServices = [];
      try {
        parsedServices = quoteServices ? JSON.parse(quoteServices) : [];
      } catch (err) {
        parsedServices = quoteServices.split(",").map((s) => ({ name: s.trim(), price: parseFloat(quoteCost) || 0 }));
      }

      const res = await fetch("/api/admin/business/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: quoteClient,
          services: parsedServices,
          estimatedCost: parseFloat(quoteCost),
          expiry: quoteExpiry,
          notes: quoteNotes || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save quote");
      setShowQuoteModal(false);
      fetchQuotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/business/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: propClient,
          projectId: propProject || null,
          title: propTitle,
          price: parseFloat(propPrice),
          tax: parseFloat(propTax) || 0,
          discount: parseFloat(propDiscount) || 0,
          validUntil: propExpiry,
          scopeOfWork: propScope || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save proposal");
      setShowProposalModal(false);
      fetchProposals();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/business/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: invClient,
          projectId: invProject || null,
          amount: parseFloat(invAmount),
          tax: parseFloat(invTax) || 0,
          discount: parseFloat(invDiscount) || 0,
          dueDate: invDue,
        }),
      });

      if (!res.ok) throw new Error("Failed to save invoice");
      setShowInvoiceModal(false);
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  // Convert Quote → Proposal
  const handleConvertQuote = async (id) => {
    try {
      const res = await fetch(`/api/admin/business/quotes/${id}/convert`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to convert quote");
      fetchQuotes();
      alert("Successfully converted Quote to a Draft Proposal!");
    } catch (err) {
      alert(err.message);
    }
  };

  // Duplicate proposal
  const handleDuplicateProposal = async (id) => {
    try {
      const res = await fetch(`/api/admin/business/proposals/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to duplicate proposal");
      fetchProposals();
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark invoice paid
  const handleMarkInvoicePaid = async (id) => {
    try {
      const res = await fetch(`/api/admin/business/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (!res.ok) throw new Error("Failed to mark invoice paid");
      fetchInvoices();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-slate-100 font-sans">
      {/* Header operations */}
      <div className="flex justify-between items-center border-b border-slate-850 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance & Billing</h1>
          <p className="text-sm text-slate-450 mt-1">
            Manage quotes, scope proposals, invoices and revenue pipelines
          </p>
        </div>
      </div>

      {/* Workspace Navigation tabs */}
      <div className="flex border-b border-slate-850 gap-6">
        {[
          { id: "overview", label: "Overview Dashboard" },
          { id: "quotes", label: "Quotations" },
          { id: "proposals", label: "Proposals Log" },
          { id: "invoices", label: "Invoices Ledger" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ────────────────── OVERVIEW DASHBOARD VIEW ────────────────── */}
      {activeTab === "overview" && stats && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/25 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Monthly Revenue</span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-2">${stats.monthlyRevenue.toLocaleString()}</h2>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} />
                  <span>This calendar month</span>
                </p>
              </div>
              <div className="p-3 bg-emerald-650/20 text-emerald-400 rounded-xl">
                <CircleDollarSign size={24} />
              </div>
            </div>

            <div className="p-6 bg-slate-900/25 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Yearly Revenue</span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-2">${stats.yearlyRevenue.toLocaleString()}</h2>
                <p className="text-xs text-violet-400 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} />
                  <span>This calendar year</span>
                </p>
              </div>
              <div className="p-3 bg-violet-650/20 text-violet-400 rounded-xl">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="p-6 bg-slate-900/25 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Unpaid Invoices</span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-2">${stats.invoicesPendingValue.toLocaleString()}</h2>
                <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                  <BadgeAlert size={12} />
                  <span>Awaiting payment clearance</span>
                </p>
              </div>
              <div className="p-3 bg-amber-650/20 text-amber-400 rounded-xl">
                <FileText size={24} />
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="p-6 bg-slate-900/15 border border-slate-850 rounded-2xl flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-200">Recent Financial Operations</h3>
            <div className="flex flex-col gap-3">
              {stats.recentActivity.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-250">{log.action}</span>
                    <span>·</span>
                    <span>User {log.user?.name} updated workspace</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-slate-500 text-xs py-2">No recent billing activity found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── QUOTATIONS VIEW ────────────────── */}
      {activeTab === "quotes" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowQuoteModal(true)}
              className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus size={16} />
              <span>Create Quote</span>
            </button>
          </div>

          <div className="bg-slate-900/15 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="bg-slate-950/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-850">
                  <th className="p-4">Client</th>
                  <th className="p-4">Estimated Cost</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-900/10">
                    <td className="p-4 font-semibold text-slate-200">{q.client?.companyName}</td>
                    <td className="p-4 font-mono font-bold">${q.estimatedCost.toLocaleString()}</td>
                    <td className="p-4 font-mono">{new Date(q.expiry).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        q.isConverted ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/20" : "text-slate-400 bg-slate-950 border-slate-900"
                      }`}>
                        {q.isConverted ? "CONVERTED" : "OPEN"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {!q.isConverted && (
                        <button
                          onClick={() => handleConvertQuote(q.id)}
                          className="bg-violet-950 text-violet-400 border border-violet-900/30 hover:bg-violet-900 hover:text-white px-3 py-1.5 rounded text-[10px] font-semibold transition"
                        >
                          Convert Proposal
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No quotes catalogued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── PROPOSALS VIEW ────────────────── */}
      {activeTab === "proposals" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowProposalModal(true)}
              className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus size={16} />
              <span>Prepare Proposal</span>
            </button>
          </div>

          <div className="bg-slate-900/15 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="bg-slate-950/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-850">
                  <th className="p-4">Proposal #</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/10">
                    <td className="p-4 font-mono font-bold text-indigo-400">{p.proposalNumber}</td>
                    <td className="p-4 text-slate-200">{p.client?.companyName}</td>
                    <td className="p-4 max-w-[200px] truncate">{p.title}</td>
                    <td className="p-4 font-mono font-semibold">${p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        p.status === "ACCEPTED" ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/20" :
                        p.status === "SENT" ? "text-sky-400 bg-sky-950/40 border-sky-900/20" :
                        "text-slate-450 bg-slate-950 border-slate-900"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      <Link
                        href={`/admin/finance/document/preview?type=proposal&id=${p.id}`}
                        className="bg-slate-950 text-slate-300 border border-slate-850 hover:bg-slate-900 px-3 py-1.5 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <ExternalLink size={12} />
                        <span>Preview</span>
                      </Link>
                      <button
                        onClick={() => handleDuplicateProposal(p.id)}
                        className="p-1.5 hover:bg-slate-900 border border-slate-850 rounded text-slate-400 hover:text-slate-200 transition"
                        title="Duplicate Proposal"
                      >
                        <Copy size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No proposals catalogued.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── INVOICES VIEW ────────────────── */}
      {activeTab === "invoices" && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus size={16} />
              <span>Create Invoice</span>
            </button>
          </div>

          <div className="bg-slate-900/15 border border-slate-850 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs leading-normal">
              <thead>
                <tr className="bg-slate-950/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-850">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-900/10">
                    <td className="p-4 font-mono font-bold text-indigo-400">{inv.invoiceNumber}</td>
                    <td className="p-4 text-slate-200">{inv.client?.companyName}</td>
                    <td className="p-4 font-mono font-semibold">${inv.total.toLocaleString()}</td>
                    <td className="p-4 font-mono">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        inv.status === "PAID" ? "text-emerald-400 bg-emerald-950/40 border-emerald-900/20" :
                        inv.status === "SENT" ? "text-sky-400 bg-sky-950/40 border-sky-900/20" :
                        "text-slate-450 bg-slate-950 border-slate-900"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2.5">
                      {inv.status !== "PAID" && (
                        <button
                          onClick={() => handleMarkInvoicePaid(inv.id)}
                          className="bg-emerald-950 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900 hover:text-white px-2.5 py-1 rounded text-[10px] font-semibold transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      <Link
                        href={`/admin/finance/document/preview?type=invoice&id=${inv.id}`}
                        className="bg-slate-950 text-slate-300 border border-slate-850 hover:bg-slate-900 px-3 py-1.5 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <ExternalLink size={12} />
                        <span>Preview</span>
                      </Link>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No invoices generated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL: CREATE QUOTE ────────────────── */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/20">
              <h3 className="font-semibold text-slate-200">Prepare Quick Quote</h3>
            </div>
            <form onSubmit={handleQuoteSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-350">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Target Client Company</label>
                <select
                  required
                  value={quoteClient}
                  onChange={(e) => setQuoteClient(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cost Estimate ($)</label>
                <input
                  type="number"
                  required
                  value={quoteCost}
                  onChange={(e) => setQuoteCost(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  placeholder="Estimated project value"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Services Scope (Comma-separated)</label>
                <input
                  type="text"
                  required
                  value={quoteServices}
                  onChange={(e) => setQuoteServices(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  placeholder="Web Development, SEO optimization"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={quoteExpiry}
                  onChange={(e) => setQuoteExpiry(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Internal Notes</label>
                <textarea
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none h-16"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="text-slate-400 hover:text-slate-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-755 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Save Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL: CREATE PROPOSAL ────────────────── */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/20">
              <h3 className="font-semibold text-slate-200">Prepare New Proposal</h3>
            </div>
            <form onSubmit={handleProposalSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-350">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Client</label>
                <select
                  required
                  value={propClient}
                  onChange={(e) => setPropClient(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  placeholder="Website Redesign 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Base Price ($)</label>
                  <input
                    type="number"
                    required
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Validity Expiry</label>
                  <input
                    type="date"
                    required
                    value={propExpiry}
                    onChange={(e) => setPropExpiry(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Scope Description</label>
                <textarea
                  value={propScope}
                  onChange={(e) => setPropScope(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none h-20"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="text-slate-400 hover:text-slate-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-755 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Save Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── MODAL: CREATE INVOICE ────────────────── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/20">
              <h3 className="font-semibold text-slate-200">Prepare New Invoice</h3>
            </div>
            <form onSubmit={handleInvoiceSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-355">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Target Client</label>
                <select
                  required
                  value={invClient}
                  onChange={(e) => setInvClient(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Billing Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invDue}
                    onChange={(e) => setInvDue(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tax (+ $)</label>
                  <input
                    type="number"
                    value={invTax}
                    onChange={(e) => setInvTax(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Discount (- $)</label>
                  <input
                    type="number"
                    value={invDiscount}
                    onChange={(e) => setInvDiscount(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-slate-400 hover:text-slate-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-violet-650 hover:bg-violet-755 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
