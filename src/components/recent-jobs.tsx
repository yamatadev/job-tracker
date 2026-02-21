"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Job {
  id: string; title: string; company: string; location: string;
  salary: string | null; source: string; status: string; tags: string[]; url: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700", SAVED: "bg-amber-100 text-amber-700",
  APPLIED: "bg-green-100 text-green-700", INTERVIEW: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700", OFFER: "bg-emerald-100 text-emerald-700",
};

export function RecentJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs?limit=10").then((r) => r.json()).then((d) => { setJobs(d.jobs); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-200 p-6"><div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div></div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Jobs</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {jobs.map((job) => (
          <div key={job.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{job.title}</h4>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{job.company} · {job.location}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[job.status] || "bg-gray-100"}`}>{job.status}</span>
                  <span className="text-[10px] text-gray-400 uppercase">{job.source}</span>
                  {job.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded hidden sm:inline">{tag}</span>
                  ))}
                </div>
              </div>
              {job.salary && <span className="text-xs font-medium text-green-600 flex-shrink-0 hidden sm:block">{job.salary}</span>}
            </div>
          </div>
        ))}
      </div>
      {jobs.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No jobs yet. Run the scraper first.</div>}
    </div>
  );
}