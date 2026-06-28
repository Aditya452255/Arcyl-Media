"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Printer, ChevronLeft, Download, Mail, Check } from "lucide-react";

function DocumentPreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // "proposal" or "invoice"
  const id = searchParams.get("id");

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    if (!id || !type) {
      setError("Missing document parameter parameters");
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/admin/business/${type}s/${id}`);
        if (!res.ok) throw new Error(`Failed to load ${type} details`);
        const payload = await res.json();
        setDoc(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id, type]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    setSendingEmail(true);
    setEmailSuccess(false);
    try {
      const res = await fetch(`/api/admin/business/${type}s/${id}/email`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to dispatch email");
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-violet-650/30 border-t-violet-550 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex flex-col justify-center items-center text-slate-100">
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-sm max-w-md text-center">
          {error || "Document not found"}
        </div>
        <button
          onClick={() => router.back()}
          className="mt-6 text-sm text-violet-400 hover:underline flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          <span>Back to Finance</span>
        </button>
      </div>
    );
  }

  const isProposal = type === "proposal";
  const number = isProposal ? doc.proposalNumber : doc.invoiceNumber;
  const dateStr = isProposal
    ? `Valid Until: ${new Date(doc.validUntil).toLocaleDateString()}`
    : `Issue Date: ${new Date(doc.issueDate).toLocaleDateString()} | Due Date: ${new Date(doc.dueDate).toLocaleDateString()}`;

  // Deliverables / cost items JSON parse helper
  const listItems = Array.isArray(doc.deliverables)
    ? doc.deliverables
    : isProposal
    ? [{ name: doc.title, description: doc.description || "General Scope", price: doc.price }]
    : [{ name: "Professional Services Rendered", description: "Agency development contract", price: doc.amount }];

  const subtotal = isProposal ? doc.price : doc.amount;
  const tax = doc.tax || 0;
  const discount = doc.discount || 0;
  const total = isProposal ? (subtotal + tax) - discount : doc.total;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 font-sans p-6 print:p-0 print:bg-white print:text-black">
      {/* Top action header (hidden on print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6 print:hidden">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 rounded-lg hover:bg-slate-900 transition"
        >
          <ChevronLeft size={14} />
          <span>Back to Finance</span>
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleEmail}
            disabled={sendingEmail}
            className="bg-slate-900 hover:bg-slate-855 text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 transition flex items-center gap-2"
          >
            {emailSuccess ? <Check size={14} className="text-emerald-400" /> : <Mail size={14} />}
            <span>{sendingEmail ? "Sending..." : emailSuccess ? "Dispatched" : "Send Email"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-lg shadow-violet-900/10"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Layout Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl p-12 flex flex-col gap-10 print:border-0 print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
          <div className="flex flex-col gap-2">
            <Image
              src="/logo-a.png"
              alt="Arcyl Media"
              width={140}
              height={32}
              className="filter brightness-0 contrast-200"
            />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              Arcyl Media AgencyOS
            </span>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-800">
              {isProposal ? "Proposal" : "Invoice"}
            </h1>
            <span className="text-sm font-mono font-bold text-indigo-650 mt-1 block">
              {number}
            </span>
            <span className="text-xs text-slate-450 mt-1 block">{dateStr}</span>
          </div>
        </div>

        {/* Sender & Receiver Ledger Details */}
        <div className="grid grid-cols-2 gap-8 text-xs leading-normal">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Issued By:</span>
            <div className="text-slate-700">
              <strong className="text-slate-800">Arcyl Media Solutions Inc.</strong>
              <p className="mt-1">
                72 Innovation Boulevard, Suite 500<br />
                Bangalore, KA 560001<br />
                GSTIN: 29AAFCA8271A1ZS<br />
                billing@arcylmedia.com
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Prepared For:</span>
            <div className="text-slate-700">
              <strong className="text-slate-800">{doc.client?.companyName}</strong>
              <p className="mt-1">
                {doc.client?.address || "Address details on file"}<br />
                Client ID: {doc.clientId}<br />
                Status: {doc.status}
              </p>
            </div>
          </div>
        </div>

        {/* Scope and SOW (Proposals Only) */}
        {isProposal && (doc.scopeOfWork || doc.timeline) && (
          <div className="flex flex-col gap-4 text-xs leading-relaxed text-slate-750">
            {doc.scopeOfWork && (
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-550 uppercase tracking-wider text-[10px]">Scope of Work</span>
                <p>{doc.scopeOfWork}</p>
              </div>
            )}
            {doc.timeline && (
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                <span className="font-bold text-slate-550 uppercase tracking-wider text-[10px]">Timeline Mapping</span>
                <p>{doc.timeline}</p>
              </div>
            )}
          </div>
        )}

        {/* Deliverables / Pricing Grid Table */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            Cost breakdown details
          </span>
          <table className="w-full text-left text-xs leading-normal">
            <thead>
              <tr className="border-b border-slate-150 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5">Item & Description</th>
                <th className="py-2.5 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {listItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <strong>{item.name || item.title || "Consulting Item"}</strong>
                    {item.description && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono font-semibold">
                    ${(item.price || item.cost || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations / Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100 text-xs">
          <div className="w-64 flex flex-col gap-2 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span>+${tax.toLocaleString()}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-emerald-650">
                <span>Discount:</span>
                <span>-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 font-sans font-bold text-slate-900 text-sm">
              <span>Total due:</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Invoice Payment Instructions / Signature Placeholder */}
        <div className="border-t border-slate-100 pt-8 mt-4 grid grid-cols-2 gap-8 text-[11px] text-slate-500 leading-relaxed">
          {isProposal ? (
            <div className="flex flex-col gap-2">
              <strong className="text-slate-700">Client Authorization:</strong>
              <p>By signing below, the client agrees to the terms, scope, and pricing outlined in this proposal document.</p>
              <div className="h-10 border-b border-slate-200 mt-2 w-48" />
              <span className="text-[9px] mt-1">Authorized Representative Signature</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <strong className="text-slate-700">Bank Wire Details:</strong>
              <p>
                Bank: Federal Bank of Commerce<br />
                Account: 4882-9901-2291<br />
                Routing: IFSC SCIN000291<br />
                Please include invoice number in payment notes.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 items-end justify-end text-right">
            <strong className="text-slate-700">Agency Validation:</strong>
            <p>Prepared digitally by Arcyl Media Solutions.</p>
            <div className="w-24 h-24 border border-slate-200 rounded flex items-center justify-center text-[8px] uppercase tracking-wider text-slate-400 font-mono">
              [ QR Code ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-violet-650/30 border-t-violet-550 rounded-full animate-spin" />
      </div>
    }>
      <DocumentPreviewContent />
    </Suspense>
  );
}
