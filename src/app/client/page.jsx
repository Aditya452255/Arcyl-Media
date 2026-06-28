"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Invalid credentials");
      }

      // Check if user is associated with a client company
      const profileRes = await fetch("/api/auth/me");
      if (profileRes.ok) {
        const profilePayload = await profileRes.json();
        // Since profile details might not contain clientId, let's load client dashboard to verify access
        const clientCheck = await fetch("/api/client/dashboard");
        if (clientCheck.ok) {
          router.push("/client/dashboard");
          return;
        }
      }

      throw new Error("Access Denied: Logged in account is not linked to a Client portal.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 select-none">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo-a.png"
            alt="Arcyl Logo"
            width={160}
            height={36}
            className="filter brightness-0 invert"
            priority
          />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-2">
            Client Collaboration Portal
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-550" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-655 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-555" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-655 focus:outline-none focus:border-violet-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 rounded-lg text-sm mt-4 transition shadow-lg shadow-violet-900/10"
          >
            <span>{loading ? "Verifying Portal..." : "Enter Client Workspace"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-slate-500 text-[10px]">
            To request portal access credentials, please contact your project manager.
          </p>
        </div>
      </div>
    </div>
  );
}
