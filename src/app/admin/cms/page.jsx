"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, X } from "lucide-react";

const MODULE_SPECS = {
  hero: {
    label: "Hero Headers",
    titleField: "title",
    fields: [
      { name: "title", label: "Main Headline Title", type: "text", required: true },
      { name: "subtitle", label: "Subheadline Subtitle", type: "text" },
      { name: "ctaText", label: "CTA Action Button Text", type: "text" },
      { name: "ctaLink", label: "CTA Action URL Link", type: "text" },
      { name: "backgroundImage", label: "Background Media URL", type: "text" },
      { name: "displayOrder", label: "Sorting Display Order", type: "number" },
    ],
  },
  about: {
    label: "About Section",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content", label: "Description Paragraph Content", type: "textarea", required: true },
      { name: "image", label: "Image Attachment URL", type: "text" },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  service: {
    label: "Services Listing",
    titleField: "title",
    fields: [
      { name: "title", label: "Service Name Title", type: "text", required: true },
      { name: "description", label: "Description summary", type: "textarea", required: true },
      { name: "icon", label: "Icon Keyword Name", type: "text" },
      { name: "slug", label: "Unique URL Slug", type: "text", required: true },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  portfolio: {
    label: "Portfolio Projects",
    titleField: "title",
    fields: [
      { name: "title", label: "Project Title", type: "text", required: true },
      { name: "description", label: "Project Details Description", type: "textarea", required: true },
      { name: "image", label: "Project Mockup Image URL", type: "text" },
      { name: "category", label: "Category Division", type: "text" },
      { name: "clientName", label: "Client Name", type: "text" },
      { name: "projectDate", label: "Completion Date", type: "text" },
      { name: "ctaLink", label: "Case Study URL Link", type: "text" },
      { name: "slug", label: "Unique URL Slug", type: "text", required: true },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  testimonial: {
    label: "Testimonials",
    titleField: "author",
    fields: [
      { name: "author", label: "Author Full Name", type: "text", required: true },
      { name: "company", label: "Company Organization Name", type: "text" },
      { name: "role", label: "Job Title Designation", type: "text" },
      { name: "content", label: "Review Content Quote", type: "textarea", required: true },
      { name: "image", label: "Avatar Image URL", type: "text" },
      { name: "rating", label: "Review Rating (1-5)", type: "number" },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  faq: {
    label: "FAQs Accordion",
    titleField: "question",
    fields: [
      { name: "question", label: "FAQ Question Detail", type: "text", required: true },
      { name: "answer", label: "FAQ Answer Content", type: "textarea", required: true },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  technology: {
    label: "Technologies Catalog",
    titleField: "name",
    fields: [
      { name: "name", label: "Technology Name", type: "text", required: true },
      { name: "category", label: "Division Category", type: "text" },
      { name: "logo", label: "Logo URL Link", type: "text" },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  teamMember: {
    label: "Team Members",
    titleField: "name",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "role", label: "Designation Job Title", type: "text", required: true },
      { name: "bio", label: "Bio Summary Description", type: "textarea" },
      { name: "image", label: "Headshot Image URL", type: "text" },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  socialLink: {
    label: "Social Links",
    titleField: "platform",
    fields: [
      { name: "platform", label: "Platform Name (e.g. LinkedIn)", type: "text", required: true },
      { name: "url", label: "Full Profile URL Link", type: "text", required: true },
      { name: "displayOrder", label: "Display Order", type: "number" },
    ],
  },
  footer: {
    label: "Footer Links Block",
    titleField: "copyrightText",
    fields: [
      { name: "copyrightText", label: "Copyright text block", type: "text", required: true },
    ],
  },
};

export default function AdminCmsPage() {
  const [activeModule, setActiveModule] = useState("hero");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editor State
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const spec = MODULE_SPECS[activeModule];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cms/${activeModule}`);
      if (!res.ok) throw new Error("Failed to load CMS blocks items list");
      const payload = await res.json();
      setItems(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeModule]);

  useEffect(() => {
    fetchItems();
    setEditingItem(null);
    setFormValues({});
    setValidationErrors([]);
  }, [activeModule, fetchItems]);

  const handleInputChange = (fieldName, val, type) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: type === "number" ? (val !== "" ? Number(val) : "") : val,
    }));
  };

  const startCreate = () => {
    const defaults = {};
    spec.fields.forEach((f) => {
      defaults[f.name] = f.type === "number" ? 0 : f.type === "boolean" ? false : "";
    });
    defaults.isPublished = false;

    setEditingItem({ id: "NEW" });
    setFormValues(defaults);
    setValidationErrors([]);
  };

  const startEdit = (item) => {
    const values = {};
    spec.fields.forEach((f) => {
      values[f.name] = item[f.name] ?? (f.type === "number" ? 0 : "");
    });
    values.isPublished = item.isPublished ?? false;

    setEditingItem(item);
    setFormValues(values);
    setValidationErrors([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors([]);

    const isNew = editingItem.id === "NEW";
    const url = isNew
      ? `/api/admin/cms/${activeModule}`
      : `/api/admin/cms/${activeModule}/${editingItem.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });

      const payload = await res.json();
      if (!res.ok) {
        if (payload.error?.code === "VALIDATION_ERROR") {
          setValidationErrors(payload.error.details || []);
          throw new Error("Validation Failed");
        }
        throw new Error(payload.message || "Failed to save block item");
      }

      setEditingItem(null);
      setFormValues({});
      fetchItems();
    } catch (err) {
      if (err.message !== "Validation Failed") {
        alert(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const res = await fetch(`/api/admin/cms/${activeModule}/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...item,
          isPublished: !item.isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to change published state");
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this CMS content block?")) return;
    try {
      const res = await fetch(`/api/admin/cms/${activeModule}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete CMS item");
      fetchItems();
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Module Selector Sidebar */}
      <aside className="w-56 bg-slate-900/20 border border-slate-800/80 rounded-xl p-4 shrink-0 flex flex-col gap-1.5 select-none h-fit">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
          CMS Modules
        </span>
        {Object.entries(MODULE_SPECS).map(([key, value]) => {
          const isActive = activeModule === key;
          return (
            <button
              key={key}
              onClick={() => setActiveModule(key)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition ${
                isActive
                  ? "bg-violet-600/10 text-violet-400 border border-violet-600/20"
                  : "text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-transparent"
              }`}
            >
              {value.label}
            </button>
          );
        })}
      </aside>

      {/* Main CMS Items Listing Grid */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-100">{spec.label} Editor</h1>
            <p className="text-xs text-slate-400 mt-1">Configure layout, sections, and items</p>
          </div>
          <button
            onClick={startCreate}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Create Block</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/80 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                <th className="p-4">Content Header</th>
                {activeModule !== "footer" && <th className="p-4">Sort Order</th>}
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <span className="w-6 h-6 border-2 border-violet-600/30 border-t-violet-500 rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                    No content blocks created yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/10 transition">
                    <td className="p-4 font-semibold text-slate-200">
                      {item[spec.titleField] || "Untitled Block"}
                      {item.slug && <span className="block text-[10px] text-slate-500 font-mono mt-0.5">/{item.slug}</span>}
                    </td>
                    {activeModule !== "footer" && <td className="p-4 text-slate-400 font-semibold">{item.displayOrder ?? 0}</td>}
                    <td className="p-4">
                      {["siteSetting", "footer"].includes(activeModule) ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-400 uppercase">
                          CONFIGURED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`flex items-center gap-1 text-[10px] font-bold uppercase transition ${
                            item.isPublished ? "text-emerald-400" : "text-slate-500"
                          }`}
                        >
                          {item.isPublished ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{item.isPublished ? "Published" : "Draft"}</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-violet-400 hover:bg-slate-800/40 rounded transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!["siteSetting", "footer"].includes(activeModule) && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800/40 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor sidebar drawer */}
      {editingItem && (
        <aside className="w-[450px] bg-slate-900 border-l border-slate-800 h-[calc(100vh-10rem)] rounded-xl sticky top-8 flex flex-col justify-between overflow-hidden shadow-2xl select-none">
          <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                {editingItem.id === "NEW" ? `Create ${spec.label}` : `Edit Item`}
              </h2>
            </div>
            <button
              onClick={() => setEditingItem(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {spec.fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    value={formValues[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value, "text")}
                    required={field.required}
                    rows="5"
                    className="w-full p-3 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition placeholder-slate-700 resize-none"
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value, field.type)}
                    required={field.required}
                    className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
                  />
                )}
                {validationErrors.find((e) => e.field === field.name) && (
                  <span className="text-[10px] text-red-400">
                    {validationErrors.find((e) => e.field === field.name).message}
                  </span>
                )}
              </div>
            ))}

            {!["siteSetting", "footer"].includes(activeModule) && (
              <div className="flex items-center gap-3 mt-4 bg-slate-950/45 p-3 rounded-lg border border-slate-850">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formValues.isPublished || false}
                  onChange={(e) => handleInputChange("isPublished", e.target.checked, "boolean")}
                  className="rounded border-slate-800 text-violet-600 focus:ring-violet-600 bg-slate-950"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Publish block immediately (visible to visitors)
                </label>
              </div>
            )}
          </form>

          <div className="p-5 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-xs font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-semibold rounded-lg transition flex items-center justify-center min-w-[70px]"
            >
              {saving ? "Saving..." : "Save Block"}
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
