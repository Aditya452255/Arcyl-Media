"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight, Building, User, CheckCircle2 } from "lucide-react";

export default function ClientLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Signup fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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

      // Verify portal client access by loading the client dashboard
      const clientCheck = await fetch("/api/client/dashboard");
      if (clientCheck.ok) {
        router.push("/client/dashboard");
      } else {
        throw new Error("Access Denied: Logged in account is not linked to a Client portal.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: signupEmail,
          company,
          password: signupPassword,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.message || "Signup failed");
      }

      setSuccess("Account created successfully! You can now log in using your credentials.");
      setIsLogin(true);
      setEmail(signupEmail);
      setPassword("");
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

        {/* Tab Selector */}
        <div className="grid grid-cols-2 bg-slate-950/60 p-1 border border-slate-850 rounded-lg text-xs font-semibold">
          <button
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
            className={`py-1.5 rounded-md transition ${isLogin ? "bg-violet-600 text-white" : "text-slate-450 hover:text-slate-200"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
            className={`py-1.5 rounded-md transition ${!isLogin ? "bg-violet-600 text-white" : "text-slate-450 hover:text-slate-200"}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/30 rounded-xl text-emerald-400 text-xs flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ────────────────── LOGIN FORM ────────────────── */}
        {isLogin ? (
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
              <span>{loading ? "Verifying..." : "Enter Workspace"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          /* ────────────────── SIGNUP FORM ────────────────── */
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-550" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-655 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Company / Organization</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-slate-550" size={16} />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-655 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-550" size={16} />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="client@acme.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-655 focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase">Choose Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-555" size={16} />
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
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
              <span>{loading ? "Creating Account..." : "Create Client Account"}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-slate-500 text-[10px]">
            New client portal registries will create a new tenant workspace in the database.
          </p>
        </div>
      </div>
    </div>
  );
}
