"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    googleAnalyticsId: "",
    metaTitle: "",
    metaDescription: "",
    logo: "",
    openGraphImage: "",
    favicon: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const payload = await res.json();
        const s = payload.data || {};
        setForm({
          companyName: s.companyName || "",
          email: s.email || "",
          phone: s.phone || "",
          address: s.address || "",
          googleAnalyticsId: s.googleAnalyticsId || "",
          metaTitle: s.metaTitle || "",
          metaDescription: s.metaDescription || "",
          logo: s.logo || "",
          openGraphImage: s.openGraphImage || "",
          favicon: s.favicon || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to update configurations");

      setSuccess("Website settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Global Website Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure brand parameters, SEO metadata, and analytical endpoints</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Module 1: Corporate Details */}
        <div className="bg-slate-900/20 border border-slate-800/80 p-6 rounded-xl flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
            Company Contact details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Company Name
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Corporate Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Office Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Physical Office Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Module 2: SEO & Analytics */}
        <div className="bg-slate-900/20 border border-slate-800/80 p-6 rounded-xl flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
            SEO & Analytics Identifiers
          </h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Google Analytics ID (Tag Manager)
            </label>
            <input
              type="text"
              value={form.googleAnalyticsId}
              onChange={(e) => handleInputChange("googleAnalyticsId", e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition placeholder-slate-700"
              placeholder="e.g. G-XXXXXXX"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Default Meta Title
              </label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Default Meta Description
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                rows="3"
                className="w-full p-3 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Assets links */}
        <div className="bg-slate-900/20 border border-slate-800/80 p-6 rounded-xl flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
            Design Assets URLs (Cloudinary Links)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Company Brand Logo URL
              </label>
              <input
                type="text"
                value={form.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                OpenGraph Cover Image URL
              </label>
              <input
                type="text"
                value={form.openGraphImage}
                onChange={(e) => handleInputChange("openGraphImage", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Browser Favicon URL
              </label>
              <input
                type="text"
                value={form.favicon}
                onChange={(e) => handleInputChange("favicon", e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-lg shadow-violet-900/20"
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
