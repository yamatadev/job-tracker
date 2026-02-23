import axios from "axios";
import { ScrapedJob } from "./types";
import { isEnglishOnly, parseSeniority } from "./utils";

const FEEDS = [
  "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
  "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
];

function extractCdata(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${tag}>`, "i");
  const m = xml.match(re);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

function extractLink(body: string): string {
  // <link> in RSS is plain text (no CDATA). Use [^<]+ to safely cross whitespace.
  const m = body.match(/<link>([^<]+)<\/link>/);
  if (m?.[1]?.trim()) return m[1].trim();
  // Fallback: use <guid> which is always a permalink on WWR
  const g = body.match(/<guid[^>]*>([^<]+)<\/guid>/);
  return g?.[1]?.trim() ?? "";
}

function parseItems(xml: string): Array<{ title: string; link: string; description: string; region: string }> {
  const items: Array<{ title: string; link: string; description: string; region: string }> = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRe.exec(xml)) !== null) {
    const body = match[1];
    const title = extractCdata(body, "title");
    const link = extractLink(body);
    const description = extractCdata(body, "description");
    const region = extractCdata(body, "region");

    if (title && link) {
      items.push({ title, link, description, region });
    }
  }

  return items;
}

export async function scrapeWeWorkRemotely(): Promise<ScrapedJob[]> {
  const seen = new Set<string>();
  const all: ScrapedJob[] = [];

  for (const feed of FEEDS) {
    try {
      const response = await axios.get<string>(feed, {
        headers: { "User-Agent": "Mozilla/5.0 JobTracker/1.0", Accept: "application/rss+xml, text/xml" },
        timeout: 15000,
        responseType: "text",
      });

      const items = parseItems(response.data);

      for (const item of items) {
        if (!item.link || seen.has(item.link)) continue;
        seen.add(item.link);

        const plainDesc = item.description?.replace(/<[^>]*>/g, "") || "";
        if (!isEnglishOnly(item.title, plainDesc)) continue;

        // WWR titles are formatted as "Company HQ Location: Job Title"
        let company = "Unknown";
        let title = item.title;
        const colonIdx = item.title.indexOf(": ");
        if (colonIdx > 0) {
          company = item.title.slice(0, colonIdx).trim();
          title = item.title.slice(colonIdx + 2).trim();
        }

        all.push({
          title,
          company,
          location: item.region || "Worldwide",
          description: item.description || "",
          shortDescription: plainDesc.slice(0, 200) + (plainDesc.length > 200 ? "..." : ""),
          url: item.link,
          tags: [],
          remote: true,
          seniority: parseSeniority(title, plainDesc),
        });
      }
    } catch (error) {
      console.error(`We Work Remotely error for feed ${feed}:`, error);
    }
  }

  return all;
}
