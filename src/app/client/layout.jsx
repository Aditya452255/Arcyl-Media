"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  FolderOpen,
  MessageSquare,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function ClientLayout({ children }) {
  const [clientData, setClientData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/client/dashboard");
        if (res.ok) {
          const payload = await res.json();
          setClientData(payload.data.client);
          
          const profileRes = await fetch("/api/auth/me");
          if (profileRes.ok) {
            const profilePayload = await profileRes.json();
            setUser(profilePayload.data);
          }
          if (pathname === "/client") {
            router.push("/client/dashboard");
          }
        } else {
          if (pathname !== "/client") {
            router.push("/client");
          }
        }
      } catch (err) {
        if (pathname !== "/client") {
          router.push("/client");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/client");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === "/client") {
    return children;
  }

  const menuItems = [
    { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { label: "Projects & Workspace", href: "/client/projects", icon: FolderKanban },
    { label: "My Profile Settings", href: "/client/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div className="flex flex-col">
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <Image
              src="/logo-a.png"
              alt="Arcyl Logo"
              width={140}
              height={30}
              className="filter brightness-0 invert"
            />
          </div>

          {/* Nav Navigation */}
          <nav className="p-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
              Client Portal
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                    isActive
                      ? "bg-violet-600/10 text-violet-400 border border-violet-600/20"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-violet-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Client details & Signout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-md shadow-violet-900/20">
              {clientData?.companyName ? clientData.companyName[0] : "C"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">
                {user?.name || "Client Rep"}
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-none">
                {clientData?.companyName || "Client Portal"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition duration-150"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/10 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-550 uppercase tracking-widest font-semibold">
              Client Portal
            </span>
            <span className="text-slate-800">/</span>
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider capitalize">
              {pathname.replace("/client/", "").replace("-", " ")}
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {clientData?.companyName}
          </div>
        </header>

        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
