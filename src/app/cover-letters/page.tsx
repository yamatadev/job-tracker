"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Copy, CheckCircle, ArrowLeft } from "lucide-react";

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
      else setError(data.error || "Error");
    } catch (err) { setError(String(err)); }
    finally { setGenerating(false); }
  };

  const copyToClipboard = () => {
    if (coverLetter) { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  // Mobile: show either list or letter
  const showLetter = selectedJob && (generating || coverLetter || error);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Cover Letters</h2>
        <p className="text-gray-500 mt-1 text-sm">Generate AI-powered cover letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job list — hidden on mobile when viewing letter */}
        <div className={`bg-white rounded-xl border border-gray-200 ${showLetter ? "hidden lg:block" : ""}`}>
          <div className="p-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">Select a job</h3></div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {jobs.map((job) => (
              <button key={job.id} onClick={() => generateForJob(job.id)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedJob === job.id ? "bg-blue-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                  </div>
                  {job.coverLetter ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> : <FileText size={16} className="text-gray-300 flex-shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cover letter */}
        <div className={`bg-white rounded-xl border border-gray-200 ${!showLetter ? "hidden lg:block" : ""}`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showLetter && (
                <button onClick={() => { setSelectedJob(null); setCoverLetter(null); setError(null); }}
                  className="lg:hidden p-1 rounded hover:bg-gray-100"><ArrowLeft size={18} /></button>
              )}
              <h3 className="font-semibold text-gray-900">Cover Letter</h3>
            </div>
            {coverLetter && (
              <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                {copied ? <><CheckCircle size={14} className="text-green-500" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            )}
          </div>
          <div className="p-4 sm:p-6 min-h-[300px] lg:min-h-[400px]">
            {generating && <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 size={32} className="animate-spin mb-3" /><p className="text-sm">Generating...</p></div>}
            {error && <div className="p-4 bg-red-50 rounded-lg text-sm text-red-700">{error}</div>}
            {coverLetter && <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{coverLetter}</div>}
            {!generating && !coverLetter && !error && <div className="flex items-center justify-center h-64 text-gray-300"><p className="text-sm">Select a job to generate</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}