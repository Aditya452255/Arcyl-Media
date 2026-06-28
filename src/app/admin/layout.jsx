"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileCode,
  Users,
  Image as ImageIcon,
  Settings,
  User,
  History,
  FolderKanban,
  UsersRound,
  CircleDollarSign,
  Bot,
  Zap,
  LogOut,
  ChevronRight,
  ListTodo,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
          if (pathname === "/admin/login") {
            router.push("/admin");
          }
        } else {
          setUser(null);
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          }
        }
      } catch (err) {
        setUser(null);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/admin/login");
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

  // If on login page, just render the child login component directly
  if (pathname === "/admin/login") {
    return children;
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Tasks Manager", href: "/admin/tasks", icon: ListTodo },
    { label: "CMS Hub", href: "/admin/cms", icon: FileCode },
    { label: "CRM Leads", href: "/admin/leads", icon: Users },
    { label: "Media Library", href: "/admin/media", icon: ImageIcon },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
    { label: "Activity Logs", href: "/admin/activity-logs", icon: History },
    { label: "My Profile", href: "/admin/profile", icon: User },
  ];

  const placeholderItems = [
    { label: "Projects", icon: FolderKanban },
    { label: "Clients Manager", icon: UsersRound },
    { label: "Finance & Invoice", icon: CircleDollarSign },
    { label: "AI Content Studio", icon: Bot },
    { label: "Automation Engine", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
        <div className="flex flex-col">
          {/* Header logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <Image
              src="/logo-a.png"
              alt="Arcyl Logo"
              width={140}
              height={30}
              className="filter brightness-0 invert"
            />
          </div>

          {/* Active Navigation menu */}
          <nav className="p-4 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
              Main Operations
            </span>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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

            {/* Future placeholders */}
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mt-6 mb-2">
              Future Modules
            </span>
            {placeholderItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 cursor-not-allowed opacity-50 border border-transparent"
                  title="Coming soon in Phase 3/4"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center font-bold text-sm text-white uppercase shadow-md shadow-violet-900/20">
              {user?.name ? user.name[0] : "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">
                {user?.name || "Agent"}
              </span>
              <span className="text-[10px] text-slate-500 truncate leading-none">
                {user?.roles?.join(", ") || "Staff"}
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

      {/* Main dashboard content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/10 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              AgencyOS
            </span>
            <span className="text-slate-700">/</span>
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-wider capitalize">
              {pathname === "/admin" ? "overview" : pathname.replace("/admin/", "").replace("-", " ")}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Current session ID: <span className="font-mono text-slate-400">{user?.id?.slice(0, 8)}...</span>
          </div>
        </header>

        {/* Dynamic page node content */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
