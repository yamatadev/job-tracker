import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

interface TheMuseLocation { name: string; }
interface TheMuseLevel { name: string; }
interface TheMuseCompany { name: string; }
interface TheMuseRefs { landing_page: string; }

interface TheMuseJob {
  id: number;
  name: string;
  contents: string;
  refs: TheMuseRefs;
  locations: TheMuseLocation[];
  company: TheMuseCompany;
  levels: TheMuseLevel[];
}

interface TheMuseResponse {
  results: TheMuseJob[];
  total: number;
}

const REMOTE_KEYWORDS = ["anywhere", "remote", "flexible"];

function isRemote(locations: TheMuseLocation[]): boolean {
  return locations.some((loc) =>
    REMOTE_KEYWORDS.some((kw) => loc.name.toLowerCase().includes(kw))
  );
}

export async function scrapeTheMuse(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  for (let page = 0; page <= 3; page++) {
    try {
      const response = await axios.get<TheMuseResponse>(
        `https://www.themuse.com/api/v2/jobs?category=Software%20Engineer&page=${page}`,
        { headers: { "User-Agent": "JobTracker/1.0" }, timeout: 10000 }
      );

      for (const job of response.data.results) {
        const url = job.refs.landing_page;
        if (!url || seen.has(url)) continue;

        if (!isRemote(job.locations)) continue;

        seen.add(url);

        const plainDesc = job.contents?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(job.name, plainDesc)) continue;

        const locationStr = job.locations.map((l) => l.name).join(", ") || "Remote";

        all.push({
          title: job.name,
          company: job.company.name,
          location: locationStr,
          description: job.contents || "",
          shortDescription: plainDesc.slice(0, 200) + (plainDesc.length > 200 ? "..." : ""),
          url,
          tags: [],
          remote: true,
          seniority: parseSeniority(job.name, plainDesc),
        });
      }
    } catch (error) {
      console.error(`The Muse error on page ${page}:`, error);
    }
  }

  return all;
}
