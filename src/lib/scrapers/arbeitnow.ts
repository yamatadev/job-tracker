import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface ArbeitnowResponse { data: ArbeitnowJob[]; }
interface ArbeitnowJob {
  slug: string; title: string; company_name: string; location: string;
  remote: boolean; url: string; tags: string[]; description: string;
  salary_min?: string; salary_max?: string;
}

export async function scrapeArbeitnow(): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get<ArbeitnowResponse>("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "JobTracker/1.0" },
    });

    const techKeywords = [
      "developer", "engineer", "frontend", "backend", "fullstack",
      "full-stack", "react", "node", "typescript", "javascript",
      "php", "software", "web dev", "programmer",
    ];

    return response.data.data
      .filter((job) => {
        if (!job.remote) return false;
        const text = `${job.title} ${job.tags?.join(" ")}`.toLowerCase();
        if (!techKeywords.some((k) => text.includes(k))) return false;
        const plainDesc = job.description?.replace(/<[^>]*>/g, "") || "";
        return isEnglishOnly(job.title, plainDesc);
      })
      .map((job) => {
        const plainDesc = job.description?.replace(/<[^>]*>/g, "") || "";
        return {
          title: job.title,
          company: job.company_name,
          location: job.location || "Remote",
          salary: job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : undefined,
          description: job.description,
          shortDescription: plainDesc.slice(0, 200) + "...",
          url: job.url || `https://www.arbeitnow.com/view/${job.slug}`,
          tags: job.tags || [],
          remote: true,
          seniority: parseSeniority(job.title, plainDesc),
        };
      });
  } catch (error) {
    console.error("Arbeitnow error:", error);
    return [];
  }
}