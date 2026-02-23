import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface RemoteOKJob {
  id: string;
  url: string;
  title: string;
  company: string;
  company_logo: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  tags: string[];
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TECH_KEYWORDS = [
  "developer", "engineer", "frontend", "backend", "fullstack", "full-stack",
  "react", "node", "typescript", "javascript", "php", "software", "web dev",
  "programmer", "junior", "python", "golang", "rust", "java",
];

async function fetchRemoteOK(url: string): Promise<RemoteOKJob[]> {
  const response = await axios.get<RemoteOKJob[]>(url, {
    headers: { "User-Agent": UA },
    timeout: 15000,
  });
  // First element is a legal notice object, not a job
  return Array.isArray(response.data) ? response.data.slice(1) : [];
}

export async function scrapeRemoteOK(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  const ENDPOINTS = [
    "https://remoteok.com/api",
    "https://remoteok.com/api?tags=junior+developer",
    "https://remoteok.com/api?tags=entry-level",
  ];

  for (const endpoint of ENDPOINTS) {
    try {
      const jobs = await fetchRemoteOK(endpoint);

      for (const job of jobs) {
        const url = job.url || `https://remoteok.com/l/${job.id}`;
        if (!url || seen.has(url)) continue;

        const text = `${job.title} ${(job.tags || []).join(" ")}`.toLowerCase();
        if (!TECH_KEYWORDS.some((k) => text.includes(k))) continue;

        const plainDesc = job.description?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(job.title, plainDesc)) continue;

        seen.add(url);
        all.push({
          title: job.title,
          company: job.company,
          companyLogo: job.company_logo || undefined,
          location: job.location || "Remote",
          salary: job.salary_min && job.salary_max
            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
            : undefined,
          description: job.description,
          shortDescription: plainDesc.slice(0, 200) + "...",
          url,
          tags: job.tags || [],
          remote: true,
          seniority: parseSeniority(job.title, plainDesc),
        });
      }
    } catch (error) {
      console.error(`RemoteOK error for ${endpoint}:`, error);
    }
  }

  return all;
}
