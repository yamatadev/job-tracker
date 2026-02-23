"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Job {
  id: string; title: string; company: string; location: string;
  salary: string | null; source: string; status: string; tags: string[]; url: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-sky-900/60 text-sky-300", SAVED: "bg-amber-900/60 text-amber-300",
  APPLIED: "bg-green-900/60 text-green-300", INTERVIEW: "bg-purple-900/60 text-purple-300",
  REJECTED: "bg-red-900/60 text-red-300", OFFER: "bg-emerald-900/60 text-emerald-300",
};

export function RecentJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs?limit=10").then((r) => r.json()).then((d) => { setJobs(d.jobs); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) {
    return <div className="bg-navy-900 rounded-xl border border-navy-700 p-6"><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-navy-800 rounded-lg animate-pulse" />)}</div></div>;
  }

  return (
    <div className="bg-navy-900 rounded-xl border border-navy-700">
      <div className="p-4 sm:p-6 border-b border-navy-700">
        <h3 className="text-lg font-semibold text-slate-100">Recent Jobs</h3>
      </div>
      <div className="divide-y divide-navy-700">
        {jobs.map((job) => (
          <div key={job.id} className="p-3 sm:p-4 hover:bg-navy-800 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-100 text-sm truncate">{job.title}</h4>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 flex-shrink-0">
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{job.company} · {job.location}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[job.status] || "bg-navy-800 text-slate-400"}`}>{job.status}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{job.source}</span>
                  {job.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] bg-navy-800 text-slate-400 px-1.5 py-0.5 rounded hidden sm:inline">{tag}</span>
                  ))}
                </div>
              </div>
              {job.salary && <span className="text-xs font-medium text-emerald-400 flex-shrink-0 hidden sm:block">{job.salary}</span>}
            </div>
          </div>
        ))}
      </div>
      {jobs.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No jobs yet. Run the scraper first.</div>}
    </div>
  );
}
