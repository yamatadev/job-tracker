"use client";

import { useState, useEffect } from "react";
import { Play, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ScrapeResult { source: string; jobsFound: number; newJobs: number; errors?: string; }
interface ScrapeLog { id: string; source: string; jobsFound: number; newJobs: number; errors: string | null; createdAt: string; }

export default function ScraperPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ScrapeResult[] | null>(null);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setLogs(d.recentLogs || [])).catch(console.error);
  }, []);

  const runScraper = async () => {
    setRunning(true); setResults(null); setError(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      if (data.success) setResults(data.results);
      else setError(data.error || "Unknown error");
    } catch (err) { setError(String(err)); }
    finally { setRunning(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Scraper</h2>
        <p className="text-gray-500 mt-1 text-sm">Fetch new jobs from configured sources</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Run Scraper</h3>
            <p className="text-sm text-gray-500 mt-1">Fetches from RemoteOK and Arbeitnow</p>
          </div>
          <button onClick={runScraper} disabled={running}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto">
            {running ? <><Loader2 size={18} className="animate-spin" /> Fetching...</> : <><Play size={18} /> Fetch Jobs</>}
          </button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-green-600" /><span className="font-medium text-green-800">Done!</span></div>
            {results.map((r) => <p key={r.source} className="text-sm text-green-700">{r.source}: {r.jobsFound} found, {r.newJobs} new</p>)}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2"><AlertCircle size={18} className="text-red-600" /><span className="text-sm text-red-700">{error}</span></div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200"><h3 className="text-lg font-semibold">Scrape History</h3></div>
        <div className="divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-900">{log.source}</span>
                <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">{log.jobsFound} found</p>
                <p className="text-xs text-green-600">{log.newJobs} new</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No scrapes yet.</p>}
        </div>
      </div>
    </div>
  );
}