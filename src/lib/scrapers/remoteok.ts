import axios from "axios";
import { ScrapedJob } from "./types";

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

export async function scrapeRemoteOK(): Promise<ScrapedJob[]> {
  try {
    const response = await axios.get<RemoteOKJob[]>("https://remoteok.com/api", {
      headers: { "User-Agent": "JobTracker/1.0" },
    });

    const jobs = response.data.slice(1);

    const techKeywords = [
      "developer", "engineer", "frontend", "backend", "fullstack",
      "full-stack", "react", "node", "typescript", "javascript",
      "php", "software", "web dev", "programmer",
    ];

    return jobs
      .filter((job) => {
        const text = `${job.title} ${job.tags?.join(" ")}`.toLowerCase();
        return techKeywords.some((k) => text.includes(k));
      })
      .map((job) => ({
        title: job.title,
        company: job.company,
        companyLogo: job.company_logo || undefined,
        location: job.location || "Remote",
        salary: job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : undefined,
        description: job.description,
        shortDescription: job.description?.replace(/<[^>]*>/g, "").slice(0, 200) + "...",
        url: job.url || `https://remoteok.com/l/${job.id}`,
        tags: job.tags || [],
        remote: true,
      }));
  } catch (error) {
    console.error("RemoteOK error:", error);
    return [];
  }
}