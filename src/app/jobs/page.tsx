"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface Job {
  id: string; title: string; company: string; location: string;
  salary: string | null; shortDescription: string | null; url: string;
  source: string; status: string; tags: string[];
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
  { value: "ARBEITNOW", label: "Arbeitnow" }, { value: "MANUAL", label: "Manual" },
];

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700", SAVED: "bg-amber-100 text-amber-700",
  APPLIED: "bg-green-100 text-green-700", INTERVIEW: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-700", OFFER: "bg-emerald-100 text-emerald-700",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    params.set("page", page.toString());
    params.set("limit", "15");

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs);
    setPagination(data.pagination);
    setLoading(false);
  }, [search, status, source, page]);

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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Jobs</h2>
        <p className="text-gray-500 mt-1 text-sm">{pagination?.total || 0} jobs found</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search jobs..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Job cards */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{job.title}</h3>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.company} · {job.location}
                    {job.salary && <span className="text-green-600 font-medium"> · {job.salary}</span>}
                  </p>
                  {job.shortDescription && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.shortDescription}</p>}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {job.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[job.status] || "bg-gray-100"}`}>{job.status}</span>
                  <select value={job.status} onChange={(e) => updateStatus(job.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => <option key={o.value} value={o.value}>→ {o.label}</option>)}
                  </select>
                  <span className="text-[10px] text-gray-400 uppercase">{job.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {!loading && jobs.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No jobs found. Run the scraper first.</div>}
    </div>
  );
}