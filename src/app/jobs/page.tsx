"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Job {
  id: string; title: string; company: string; location: string;
  salary: string | null; shortDescription: string | null; url: string;
  source: string; status: string; tags: string[]; seniority: string | null;
}

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

const STATUS_OPTIONS = [
  { value: "", label: "All Status" }, { value: "NEW", label: "New" },
  { value: "SAVED", label: "Saved" }, { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" }, { value: "REJECTED", label: "Rejected" },
  { value: "OFFER", label: "Offer" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" }, { value: "REMOTEOK", label: "RemoteOK" },
  { value: "WEWORKREMOTELY", label: "We Work Remotely" }, { value: "ARBEITNOW", label: "Arbeitnow" },
  { value: "REMOTIVE", label: "Remotive" }, { value: "HIMALAYAS", label: "Himalayas" },
  { value: "JOBICY", label: "Jobicy" }, { value: "THEMUSE", label: "The Muse" },
  { value: "MANUAL", label: "Manual" },
];

const SENIORITY_OPTIONS = [
  { value: "", label: "All Levels" }, { value: "INTERN", label: "Intern" },
  { value: "JUNIOR", label: "Junior" }, { value: "MID", label: "Mid" },
  { value: "SENIOR", label: "Senior" }, { value: "LEAD", label: "Lead" },
  { value: "STAFF", label: "Staff" }, { value: "PRINCIPAL", label: "Principal" },
];

const DATE_OPTIONS = [
  { value: "", label: "All time" },
  { value: "1d", label: "Last 24 h" },
  { value: "3d", label: "Last 3 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const statusColors: Record<string, string> = {
  NEW: "bg-sky-900/60 text-sky-300", SAVED: "bg-amber-900/60 text-amber-300",
  APPLIED: "bg-green-900/60 text-green-300", INTERVIEW: "bg-purple-900/60 text-purple-300",
  REJECTED: "bg-red-900/60 text-red-300", OFFER: "bg-emerald-900/60 text-emerald-300",
};

const seniorityColors: Record<string, string> = {
  INTERN: "bg-navy-800 text-slate-400",
  JUNIOR: "bg-green-900/60 text-green-300",
  MID: "bg-sky-900/60 text-sky-300",
  SENIOR: "bg-purple-900/60 text-purple-300",
  LEAD: "bg-orange-900/60 text-orange-300",
  STAFF: "bg-red-900/60 text-red-300",
  PRINCIPAL: "bg-pink-900/60 text-pink-300",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [seniority, setSeniority] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    if (seniority) params.set("seniority", seniority);
    if (dateRange) params.set("dateRange", dateRange);
    params.set("page", page.toString());
    params.set("limit", "15");

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs);
    setPagination(data.pagination);
    setLoading(false);
  }, [search, status, source, seniority, dateRange, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateStatus = async (jobId: string, newStatus: string) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchJobs();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Jobs</h2>
        <p className="text-slate-400 mt-1 text-sm">{pagination?.total || 0} jobs found</p>
      </div>

      {/* Filters */}
      <div className="bg-navy-900 rounded-xl border border-navy-700 p-3 sm:p-4 mb-6">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search jobs..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={seniority} onChange={(e) => { setSeniority(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {SENIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 bg-navy-800 border border-navy-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Job cards */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-navy-900 rounded-xl border border-navy-700 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-navy-900 rounded-xl border border-navy-700 p-4 sm:p-5 hover:border-sky-500/50 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-100 text-sm sm:text-base truncate">{job.title}</h3>
                    {job.seniority && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${seniorityColors[job.seniority] || "bg-navy-800 text-slate-400"}`}>
                        {job.seniority}
                      </span>
                    )}
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 flex-shrink-0">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">
                    {job.company} · {job.location}
                    {job.salary && <span className="text-emerald-400 font-medium"> · {job.salary}</span>}
                  </p>
                  {job.shortDescription && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{job.shortDescription}</p>}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {job.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] bg-navy-800 text-slate-400 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[job.status] || "bg-navy-800 text-slate-400"}`}>{job.status}</span>
                  <select value={job.status} onChange={(e) => updateStatus(job.id, e.target.value)}
                    className="text-xs bg-navy-800 border border-navy-700 text-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500">
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>→ {o.label}</option>)}
                  </select>
                  <span className="text-[10px] text-slate-500 uppercase">{job.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-navy-900 rounded-xl border border-navy-700 p-4">
          <p className="text-sm text-slate-400">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-navy-700 hover:bg-navy-800 text-slate-300 disabled:opacity-50"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
              className="p-2 rounded-lg border border-navy-700 hover:bg-navy-800 text-slate-300 disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && <div className="bg-navy-900 rounded-xl border border-navy-700 p-12 text-center text-slate-500">No jobs found. Run the scraper first.</div>}
    </div>
  );
}
