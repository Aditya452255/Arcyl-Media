"use client";

import { useState, useEffect } from "react";
import { User, Lock, Building, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ClientProfilePage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/client/dashboard");
        if (res.ok) {
          const payload = await res.json();
          setCompany(payload.data.client.companyName || "");
          setPhone(payload.data.client.address || ""); // Mapped to address
          
          const userRes = await fetch("/api/auth/me");
          if (userRes.ok) {
            const userPayload = await userRes.json();
            setName(userPayload.data.name || "");
          }
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = { name, company, phone };
      if (password) payload.password = password;

      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccessMsg("Profile properties saved successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Client Account Settings</h1>
        <p className="text-sm text-slate-450 mt-1">Manage profile authentication details and company directory preferences</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="p-6 bg-slate-900/25 border border-slate-850 rounded-2xl flex flex-col gap-5 shadow-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">Representative Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-550" size={16} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">Company Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-3 text-slate-555" size={16} />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your organization name"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-400 font-semibold uppercase">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-slate-555" size={16} />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
            />
          </div>
        </div>

        <div className="border-t border-slate-850 pt-4 flex flex-col gap-4">
          <span className="text-[10px] text-slate-555 font-bold uppercase tracking-wider">Change Password (optional)</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 uppercase font-semibold">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-555" size={14} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 uppercase font-semibold">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-555" size={14} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-lg text-sm mt-2 transition"
        >
          {loading ? "Saving Changes..." : "Save Profile Settings"}
        </button>
      </form>
    </div>
  );
}
