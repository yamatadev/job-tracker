"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Copy, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Job { id: string; title: string; company: string; coverLetter: { content: string } | null; }

export default function CoverLettersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs?limit=50").then((r) => r.json()).then((d) => setJobs(d.jobs)).catch(console.error);
  }, []);

  const generateForJob = async (jobId: string) => {
    setSelectedJob(jobId); setGenerating(true); setCoverLetter(null); setError(null);
    try {
      const res = await fetch("/api/cover-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) });
      const data = await res.json();
      if (res.ok) setCoverLetter(data.content);
      else setError(data.code === "PROFILE_MISSING" ? "PROFILE_MISSING" : (data.error || "Error"));
    } catch (err) { setError(String(err)); }
    finally { setGenerating(false); }
  };

  const copyToClipboard = () => {
    if (coverLetter) { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const showLetter = selectedJob && (generating || coverLetter || error);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Cover Letters</h2>
        <p className="text-slate-400 mt-1 text-sm">Generate AI-powered cover letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job list */}
        <div className={`bg-navy-900 rounded-xl border border-navy-700 ${showLetter ? "hidden lg:block" : ""}`}>
          <div className="p-4 border-b border-navy-700"><h3 className="font-semibold text-slate-100">Select a job</h3></div>
          <div className="divide-y divide-navy-700 max-h-[600px] overflow-y-auto">
            {jobs.map((job) => (
              <button key={job.id} onClick={() => generateForJob(job.id)}
                className={`w-full text-left p-4 hover:bg-navy-800 transition-colors ${selectedJob === job.id ? "bg-sky-500/10" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100 text-sm truncate">{job.title}</p>
                    <p className="text-xs text-slate-400">{job.company}</p>
                  </div>
                  {job.coverLetter ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" /> : <FileText size={16} className="text-slate-600 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cover letter */}
        <div className={`bg-navy-900 rounded-xl border border-navy-700 ${!showLetter ? "hidden lg:block" : ""}`}>
          <div className="p-4 border-b border-navy-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showLetter && (
                <button onClick={() => { setSelectedJob(null); setCoverLetter(null); setError(null); }}
                  className="lg:hidden p-1 rounded hover:bg-navy-800 text-slate-300"><ArrowLeft size={18} /></button>
              )}
              <h3 className="font-semibold text-slate-100">Cover Letter</h3>
            </div>
            {coverLetter && (
              <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
                {copied ? <><CheckCircle size={14} className="text-emerald-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            )}
          </div>
          <div className="p-4 sm:p-6 min-h-[300px] lg:min-h-[400px]">
            {generating && <div className="flex flex-col items-center justify-center h-64 text-slate-500"><Loader2 size={32} className="animate-spin mb-3" /><p className="text-sm">Generating...</p></div>}
            {error && (
              <div className="p-4 bg-red-900/30 rounded-lg text-sm text-red-300 border border-red-800">
                {error === "PROFILE_MISSING" ? (
                  <>
                    You need to set up your candidate profile before generating cover letters.{" "}
                    <Link className="text-sky-300 underline" href="/profile">Go to Profile</Link>
                  </>
                ) : error}
              </div>
            )}
            {coverLetter && <div className="prose prose-sm max-w-none text-slate-300 whitespace-pre-wrap">{coverLetter}</div>}
            {!generating && !coverLetter && !error && <div className="flex items-center justify-center h-64 text-slate-600"><p className="text-sm">Select a job to generate</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
