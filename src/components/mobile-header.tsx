"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Briefcase, Search, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Scraper", href: "/scraper", icon: Search },
  { label: "Cover Letters", href: "/cover-letters", icon: FileText },
  { label: "Profile", href: "/profile", icon: User },
];

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="lg:hidden">
      <header className="bg-navy-900 border-b border-navy-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100">🎯 Job Tracker</h1>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-navy-800 text-slate-300">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {open && (
        <nav className="bg-navy-900 border-b border-navy-700 p-2">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-sky-500/15 text-sky-400" : "text-slate-300 hover:bg-navy-800"
                }`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      )}
    </div>
  );
}
