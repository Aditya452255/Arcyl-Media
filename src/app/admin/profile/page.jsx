"use client";

import { useEffect, useState } from "react";
import { Lock, User } from "lucide-react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Passwords Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to load user session data");
        const payload = await res.json();
        setProfile(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }

    setChanging(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Failed to update password");

      setFormSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
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

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
      {/* Profile Details Card */}
      <div className="flex-1 bg-slate-900/20 border border-slate-800/80 p-6 rounded-xl h-fit flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xl text-white uppercase">
            {profile?.name ? profile.name[0] : "A"}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-200">{profile?.name || "Agent"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{profile?.email}</p>
          </div>
        </div>

        <div className="border-t border-slate-850 pt-4 flex flex-col gap-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              Assigned Roles
            </span>
            <span className="font-bold text-slate-300 uppercase bg-slate-950/50 border border-slate-850 px-2 py-0.5 rounded text-[10px]">
              {profile?.roles?.join(", ") || "No Roles"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              Active Permission Nodes
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile?.permissions?.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-0.5 bg-violet-950/20 border border-violet-900/20 text-violet-400 font-mono text-[9px] rounded-md font-semibold"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Mutation Form */}
      <div className="w-full md:w-[480px] bg-slate-900/20 border border-slate-800/80 p-6 rounded-xl flex flex-col gap-5">
        <div className="flex items-center gap-2 text-slate-200">
          <Lock size={18} className="text-violet-400" />
          <h2 className="text-sm font-bold">Change System Password</h2>
        </div>

        {formError && (
          <div className="p-3 rounded bg-red-950/30 border border-red-900/30 text-red-400 text-xs text-center font-medium">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="p-3 rounded bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 text-xs text-center font-medium">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              New Secure Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 text-xs bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:border-violet-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={changing}
            className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg transition shadow-lg shadow-violet-900/20"
          >
            {changing ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
