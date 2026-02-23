import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface HimalayasJob {
  id: string;
  title: string;
  slug: string;
  applicationUrl: string;
  applyUrl?: string;
  company: {
    name: string;
    logoUrl?: string;
  };
  location?: string;
  salary?: {
    formatted?: string;
  };
  description: string;
  skills?: string[];
  categories?: string[];
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
}

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const TECH_KEYWORDS = [
  "developer", "engineer", "frontend", "backend", "fullstack", "full-stack",
  "react", "node", "typescript", "javascript", "php", "software", "web",
  "python", "java", "golang", "junior", "programmer",
];

export async function scrapeHimalayas(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  // Fetch two pages to get more coverage
  for (const offset of [0, 100]) {
    try {
      const response = await axios.get<HimalayasResponse>(
        `https://himalayas.app/jobs/api?limit=100&offset=${offset}`,
        { headers: { "User-Agent": UA }, timeout: 15000 }
      );

      const jobs = response.data?.jobs;
      if (!Array.isArray(jobs)) {
        console.warn(`Himalayas: unexpected response shape at offset ${offset}`, typeof response.data);
        break;
      }

      for (const job of jobs) {
        const url = job.applyUrl || job.applicationUrl || `https://himalayas.app/jobs/${job.slug}`;
        if (!url || seen.has(url)) continue;

        const text = `${job.title} ${(job.skills || []).join(" ")} ${(job.categories || []).join(" ")}`.toLowerCase();
        if (!TECH_KEYWORDS.some((k) => text.includes(k))) continue;

        const plainDesc = job.description?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(job.title, plainDesc)) continue;

        seen.add(url);
        const tags = [...(job.skills || []), ...(job.categories || [])].slice(0, 8);

        all.push({
          title: job.title,
          company: job.company.name,
          companyLogo: job.company.logoUrl || undefined,
          location: job.location || "Remote",
          salary: job.salary?.formatted || undefined,
          description: job.description,
          shortDescription: plainDesc.slice(0, 200) + "...",
          url,
          tags,
          remote: true,
          seniority: parseSeniority(job.title, plainDesc),
        });
      }
    } catch (error) {
      console.error(`Himalayas error at offset ${offset}:`, error);
    }
  }

  return all;
}
