"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Search, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Scraper", href: "/scraper", icon: Search },
  { label: "Cover Letters", href: "/cover-letters", icon: FileText },
  { label: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-navy-900 border-r border-navy-700">
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-xl font-bold text-slate-100">🎯 Job Tracker</h1>
        <p className="text-sm text-slate-400 mt-1">Remote opportunities</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-sky-500/15 text-sky-400" : "text-slate-300 hover:bg-navy-800 hover:text-slate-100"
              }`}>
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
