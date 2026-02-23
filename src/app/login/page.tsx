"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) { router.push("/"); router.refresh(); }
      else setError(data.error || "Login failed");
    } catch {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding (emerald gradient, unchanged) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-900 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-52 h-52 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <span className="text-white/90 font-semibold text-lg">Job Tracker</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Find the job.
              <br />
              <span className="text-emerald-300">Track the pipeline.</span>
              <br />
              <span className="text-cyan-300">Land the offer.</span>
            </h1>
            <p className="text-white/50 mt-4 leading-relaxed">
              Aggregate remote developer jobs from multiple sources,
              manage your applications, and generate AI-powered cover letters.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "Multi-source job scraping",
                "Application pipeline tracking",
                "AI cover letter generation",
                "Real-time job filtering",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-white/60 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/20 text-xs">
            Built by Renan Paes · renanpaes.dev
          </p>
        </div>
      </div>

      {/* Right side — Form (dark navy) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-navy-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-950 rounded-xl flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <span className="font-semibold text-lg text-slate-100">Job Tracker</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-100">Welcome back</h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to track your applications</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jobtracker.com" required
                className="w-full px-4 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-500" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-950 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-900 disabled:opacity-50 transition-colors border border-emerald-800">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-navy-700">
            <p className="text-xs text-slate-500 text-center mb-3">Demo credentials</p>
            <div className="bg-navy-800 rounded-lg p-3 text-center border border-navy-700">
              <p className="text-xs text-slate-400">admin@jobtracker.com · admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
