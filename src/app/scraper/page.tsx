"use client";

import { useState, useEffect } from "react";
import { Play, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";

interface ScrapeResult { source: string; jobsFound: number; newJobs: number; errors?: string; }
interface ScrapeLog { id: string; source: string; jobsFound: number; newJobs: number; errors: string | null; createdAt: string; }

const ALL_SOURCES = [
  { key: "REMOTEOK", label: "RemoteOK" },
  { key: "WEWORKREMOTELY", label: "We Work Remotely" },
  { key: "ARBEITNOW", label: "Arbeitnow" },
  { key: "REMOTIVE", label: "Remotive" },
  { key: "HIMALAYAS", label: "Himalayas" },
  { key: "JOBICY", label: "Jobicy" },
  { key: "THEMUSE", label: "The Muse" },
];

export default function ScraperPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ScrapeResult[] | null>(null);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(ALL_SOURCES.map((s) => s.key)));
  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  const [clearMsg, setClearMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then((d) => setLogs(d.recentLogs || [])).catch(console.error);
  }, []);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(ALL_SOURCES.map((s) => s.key)));
  const deselectAll = () => setSelected(new Set());

  const runScraper = async () => {
    setRunning(true); setResults(null); setError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        // Refresh logs
        fetch("/api/stats").then((r) => r.json()).then((d) => setLogs(d.recentLogs || [])).catch(console.error);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) { setError(String(err)); }
    finally { setRunning(false); }
  };

  const clearSource = async (sourceKey: string) => {
    const res = await fetch(`/api/jobs?source=${sourceKey}`, { method: "DELETE" });
    const data = await res.json();
    setConfirmClear(null);
    setClearMsg(`Deleted ${data.deleted} jobs from ${sourceKey}`);
    setTimeout(() => setClearMsg(null), 3000);
  };

  // Get last log stats per source
  const lastLogBySource: Record<string, ScrapeLog> = {};
  for (const log of [...logs].reverse()) {
    if (!lastLogBySource[log.source]) lastLogBySource[log.source] = log;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Scraper</h2>
        <p className="text-slate-400 mt-1 text-sm">Select sources and fetch new jobs</p>
      </div>

      {/* Flash messages */}
      {clearMsg && (
        <div className="mb-4 p-3 bg-emerald-900/40 border border-emerald-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm text-emerald-300">{clearMsg}</span>
        </div>
      )}

      {/* Source cards */}
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-4 sm:p-6 mb-6">
        {/* Top controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-100">Sources</h3>
            <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-medium">
              {selected.size} / {ALL_SOURCES.length} enabled
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-3 text-xs">
              <button onClick={selectAll} className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Select All</button>
              <button onClick={deselectAll} className="text-slate-400 hover:text-slate-300 font-medium transition-colors">Deselect All</button>
            </div>
            <button onClick={runScraper} disabled={running || selected.size === 0}
              className="flex items-center gap-2 bg-sky-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sky-400 disabled:opacity-50 transition-colors">
              {running ? <><Loader2 size={16} className="animate-spin" /> Running...</> : <><Play size={16} /> Run Selected ({selected.size})</>}
            </button>
          </div>
        </div>

        {/* Grid of source cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ALL_SOURCES.map((src) => {
            const isOn = selected.has(src.key);
            const lastLog = lastLogBySource[src.key];
            const isConfirming = confirmClear === src.key;

            return (
              <div key={src.key}
                className={`rounded-lg border p-3 transition-all ${isOn ? "border-sky-500/40 bg-sky-500/5" : "border-navy-700 bg-navy-800/50"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Toggle switch */}
                    <button onClick={() => toggle(src.key)}
                      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors ${isOn ? "bg-sky-500" : "bg-navy-600"}`}
                      aria-label={`Toggle ${src.label}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isOn ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                    <span className={`text-sm font-medium truncate ${isOn ? "text-slate-100" : "text-slate-400"}`}>{src.label}</span>
                  </div>

                  {/* Clear button */}
                  {!isConfirming && (
                    <button onClick={() => setConfirmClear(src.key)}
                      className="flex-shrink-0 p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title={`Clear ${src.label} jobs`}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Last scrape stats */}
                {lastLog && !isConfirming && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    Last: {lastLog.jobsFound} found · {lastLog.newJobs} new
                  </p>
                )}

                {/* Confirm clear */}
                {isConfirming && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-red-300">Delete all {src.label} jobs?</span>
                    <button onClick={() => clearSource(src.key)}
                      className="text-[10px] bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2 py-0.5 rounded font-medium transition-colors">
                      Confirm
                    </button>
                    <button onClick={() => setConfirmClear(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Results */}
        {results && (
          <div className="mt-4 p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
            <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-emerald-400" /><span className="font-medium text-emerald-300">Done!</span></div>
            {results.map((r) => <p key={r.source} className="text-sm text-emerald-400">{r.source}: {r.jobsFound} found, {r.newJobs} new</p>)}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 rounded-lg border border-red-800">
            <div className="flex items-center gap-2"><AlertCircle size={18} className="text-red-400" /><span className="text-sm text-red-300">{error}</span></div>
          </div>
        )}
      </div>

      {/* Scrape History */}
      <div className="bg-navy-900 rounded-xl border border-navy-700">
        <div className="p-4 sm:p-6 border-b border-navy-700"><h3 className="text-lg font-semibold text-slate-100">Scrape History</h3></div>
        <div className="divide-y divide-navy-700">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-200">{log.source}</span>
                <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300">{log.jobsFound} found</p>
                <p className="text-xs text-emerald-400">{log.newJobs} new</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="p-6 text-center text-slate-500 text-sm">No scrapes yet.</p>}
        </div>
      </div>
    </div>
  );
}
