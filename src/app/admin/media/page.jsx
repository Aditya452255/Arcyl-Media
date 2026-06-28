"use client";

import { useEffect, useState, useCallback } from "react";
import { Upload, Trash2, Copy, Check, Eye } from "lucide-react";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media?limit=24");
      if (!res.ok) throw new Error("Failed to load media catalog");
      const payload = await res.json();
      setAssets(payload.data || []);
      setPagination(payload.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "arcyl_media");

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to upload file");

      fetchAssets();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file permanently from Cloudinary?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete media asset");
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCopyUrl = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Media Library</h1>
          <p className="text-sm text-slate-400 mt-1">Upload and store images, videos, and raw assets</p>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg cursor-pointer transition disabled:opacity-50">
          <Upload size={14} />
          <span>{uploading ? "Uploading..." : "Upload File"}</span>
          <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Files Catalog Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="p-16 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-sm font-medium">
          No files uploaded yet. Pick a file above to upload to Cloudinary.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700/80 transition relative"
            >
              {/* Thumbnail Container */}
              <div className="aspect-square bg-slate-950/40 flex items-center justify-center relative overflow-hidden">
                {asset.fileType === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.altText || "Media File"}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    {asset.fileType}
                  </span>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center gap-3">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-slate-850 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition"
                    title="View Original"
                  >
                    <Eye size={14} />
                  </a>
                  <button
                    onClick={() => handleCopyUrl(asset.id, asset.url)}
                    className="p-1.5 bg-slate-850 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 bg-red-950/80 hover:bg-red-800 rounded text-red-400 hover:text-red-200 transition border border-red-900/30"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Detail Info Panel */}
              <div className="p-3 bg-slate-900/20 border-t border-slate-850">
                <div className="text-[10px] font-semibold text-slate-300 truncate leading-none mb-1">
                  {asset.altText || "Untitled File"}
                </div>
                <div className="text-[8px] font-semibold font-mono text-slate-600 uppercase tracking-wider">
                  {(asset.size / (1024 * 1024)).toFixed(2)} MB | {asset.mimeType.split("/")[1]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
