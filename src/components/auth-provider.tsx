"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User { id: string; name: string; email: string; }

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {} });

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => { if (res.ok) return res.json(); throw new Error(); })
      .then((data) => { setUser(data.user); setLoading(false); })
      .catch(() => { setUser(null); setLoading(false); if (pathname !== "/login") router.push("/login"); });
  }, [pathname, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  if (pathname === "/login") {
    return <AuthContext.Provider value={{ user, loading: false, logout }}>{children}</AuthContext.Provider>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== "/login") return null;

  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>;
}