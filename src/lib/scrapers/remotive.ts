import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  tags: string[];
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

const QUERIES = [
  // Stack-based
  "react node", "nextjs", "fullstack typescript", "fullstack node",
  "react typescript", "full-stack javascript", "php react",
  "fullstack postgresql", "frontend react typescript", "backend nodejs",
  // Junior / entry-level targeted
  "junior developer", "junior engineer", "junior frontend", "junior backend",
  "entry level developer", "entry level engineer", "junior react", "junior fullstack",
];

export async function scrapeRemotive(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  for (const query of QUERIES) {
    try {
      const response = await axios.get<RemotiveResponse>(
        `https://remotive.com/api/remote-jobs?category=software-dev&search=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "JobTracker/1.0" }, timeout: 10000 }
      );

      for (const job of response.data.jobs) {
        if (seen.has(job.url)) continue;
        seen.add(job.url);

        const plainDesc = job.description?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(job.title, plainDesc)) continue;

        all.push({
          title: job.title,
          company: job.company_name,
          companyLogo: job.company_logo || undefined,
          location: job.candidate_required_location || "Remote",
          salary: job.salary || undefined,
          description: job.description,
          shortDescription: plainDesc.slice(0, 200) + "...",
          url: job.url,
          tags: job.tags || [],
          remote: true,
          seniority: parseSeniority(job.title, plainDesc),
        });
      }
    } catch (error) {
      console.error(`Remotive error for query "${query}":`, error);
    }
  }

  return all;
}
