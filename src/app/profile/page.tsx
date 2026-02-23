"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle, AlertTriangle, Upload } from "lucide-react";

export default function ProfilePage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [applyToSummary, setApplyToSummary] = useState(true);
  const [generateSummary, setGenerateSummary] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<string | null>(null);
  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "long">("medium");
  const [previewSummary, setPreviewSummary] = useState<string | null>(null);
  const [previewHighlights, setPreviewHighlights] = useState<string[]>([]);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.profile?.summary || "");
        if (d.profile?.resumeFileName) {
          setResumeInfo(`${d.profile.resumeFileName} (${d.profile.resumeMime || "unknown"})`);
        }
      })
      .catch((e) => { setError(String(e)); })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSummary(data.profile.summary);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (preview = false) => {
    if (!file) return;
    if (preview) setPreviewing(true);
    else setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("applyToSummary", applyToSummary ? "true" : "false");
      form.append("generateSummary", generateSummary ? "true" : "false");
      form.append("summaryLength", summaryLength);
      form.append("preview", preview ? "true" : "false");
      const res = await fetch("/api/profile/resume", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (preview) {
        setPreviewSummary(data.preview?.summary || "");
        setPreviewHighlights(data.preview?.highlights || []);
      } else {
        setResumeInfo(`${data.profile.resumeFileName} (${data.profile.resumeMime || "unknown"})`);
        if (applyToSummary || generateSummary) setSummary(data.profile.summary || "");
        setPreviewSummary(null);
        setPreviewHighlights([]);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setUploading(false);
      setPreviewing(false);
    }
  };

  const remaining = 4000 - summary.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Profile</h2>
        <p className="text-slate-400 mt-1 text-sm">Used to generate personalized cover letters.</p>
      </div>

      <div className="bg-navy-900 rounded-xl border border-navy-700 p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="animate-spin" size={18} /> Loading profile...
          </div>
        ) : (
          <>
            <div className="mb-5 p-4 rounded-lg border border-navy-700 bg-navy-800/40">
              <label className="block text-sm font-medium text-slate-300 mb-2">Upload Resume (PDF or DOCX)</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-navy-700 file:text-slate-200 hover:file:bg-navy-600"
                />
                <button
                  onClick={() => uploadResume(false)}
                  disabled={!file || uploading || previewing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-slate-900 font-medium text-sm hover:bg-emerald-400 disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  Upload
                </button>
                {generateSummary && (
                  <button
                    onClick={() => uploadResume(true)}
                    disabled={!file || uploading || previewing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sky-500 text-sky-300 font-medium text-sm hover:bg-sky-500/10 disabled:opacity-60"
                  >
                    {previewing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                    Preview AI Summary
                  </button>
                )}
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={applyToSummary}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setApplyToSummary(next);
                      if (next) setGenerateSummary(false);
                    }}
                    className="accent-sky-500"
                  />
                  Replace summary with extracted text
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={generateSummary}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setGenerateSummary(next);
                      if (next) setApplyToSummary(false);
                    }}
                    className="accent-emerald-500"
                  />
                  Generate AI summary from resume
                </label>
                {generateSummary && (
                  <label className="inline-flex items-center gap-2">
                    <span>Length</span>
                    <select
                      value={summaryLength}
                      onChange={(e) => setSummaryLength(e.target.value as "short" | "medium" | "long")}
                      className="bg-navy-800 border border-navy-700 text-slate-200 rounded px-2 py-1"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </label>
                )}
                <span>Max 5MB</span>
              </div>
              {resumeInfo && <p className="mt-2 text-xs text-slate-400">Last uploaded: {resumeInfo}</p>}
            </div>

            {previewSummary && (
              <div className="mb-5 p-4 rounded-lg border border-sky-700 bg-sky-500/10">
                <p className="text-sm font-medium text-sky-300 mb-2">AI Summary Preview</p>
                <p className="text-sm text-slate-200">{previewSummary}</p>
                {previewHighlights.length > 0 && (
                  <div className="mt-3 text-xs text-slate-300">
                    <p className="text-slate-400 mb-1">Highlights</p>
                    <div className="space-y-1">
                      {previewHighlights.map((h, i) => (
                        <div key={`${h}-${i}`}>- {h}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-300 mb-2">Candidate Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={12}
              placeholder="Write a concise summary of your experience, achievements, and core skills. This text is used to personalize cover letters."
              className="w-full bg-navy-800 border border-navy-700 text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-500"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Min 50 chars. Max 4000.</span>
              <span className={remaining < 0 ? "text-red-400" : ""}>{remaining} left</span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 rounded-lg text-sm text-red-300 border border-red-800 flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-slate-900 font-medium text-sm hover:bg-sky-400 disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save
              </button>
              {saved && <span className="text-sm text-emerald-400 inline-flex items-center gap-1"><CheckCircle size={14} /> Saved</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
