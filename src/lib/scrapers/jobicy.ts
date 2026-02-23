import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobGeo: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
  jobDescription: string;
  jobIndustry?: string[];
  jobType?: string[];
}

interface JobicyResponse {
  jobs: JobicyJob[];
}

const TAGS = ["react", "nodejs", "typescript", "javascript", "php", "fullstack", "frontend", "backend", "junior"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function scrapeJobicy(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  for (const tag of TAGS) {
    try {
      const response = await axios.get<JobicyResponse>(
        `https://jobicy.com/api/v2/remote-jobs?count=50&geo=worldwide&tag=${encodeURIComponent(tag)}`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; JobTracker/1.0)" }, timeout: 10000 }
      );

      // Jobicy returns { error: "..." } on rate-limit — skip silently
      if (!Array.isArray(response.data.jobs)) {
        console.warn(`Jobicy: no jobs array for tag "${tag}", skipping`);
        await sleep(600);
        continue;
      }

      for (const job of (response.data.jobs || [])) {
        if (seen.has(job.url)) continue;
        seen.add(job.url);

        const plainDesc = job.jobDescription?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(job.jobTitle, plainDesc)) continue;

        const salary = job.annualSalaryMin && job.annualSalaryMax
          ? `${job.salaryCurrency || "$"}${job.annualSalaryMin.toLocaleString()} - ${job.annualSalaryMax.toLocaleString()}`
          : undefined;

        const tags = [...(job.jobIndustry || []), ...(job.jobType || [])];

        all.push({
          title: job.jobTitle,
          company: job.companyName,
          companyLogo: job.companyLogo || undefined,
          location: job.jobGeo || "Worldwide",
          salary,
          description: job.jobDescription,
          shortDescription: plainDesc.slice(0, 200) + "...",
          url: job.url,
          tags,
          remote: true,
          seniority: parseSeniority(job.jobTitle, plainDesc),
        });
      }
      await sleep(600);
    } catch (error) {
      console.error(`Jobicy error for tag "${tag}":`, error);
      await sleep(600);
    }
  }

  return all;
}
