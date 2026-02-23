import { prisma } from "../prisma";
import { scrapeRemoteOK } from "./remoteok";
import { scrapeArbeitnow } from "./arbeitnow";
import { scrapeRemotive } from "./remotive";
import { scrapeHimalayas } from "./himalayas";
import { scrapeJobicy } from "./jobicy";
import { scrapeTheMuse } from "./themuse";
import { scrapeWeWorkRemotely } from "./weworkremotely";
import { ScrapedJob } from "./types";
import { Source } from "@prisma/client";

interface ScrapeResult { source: Source; jobsFound: number; newJobs: number; errors?: string; }

async function saveJobs(jobs: ScrapedJob[], source: Source, userId: string): Promise<ScrapeResult> {
  let newJobs = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    try {
      const result = await prisma.job.upsert({
        where: { userId_url: { userId, url: job.url } },
        update: { title: job.title, company: job.company, salary: job.salary, description: job.description, tags: job.tags, seniority: job.seniority, location: job.location, shortDescription: job.shortDescription, companyLogo: job.companyLogo, remote: job.remote },
        create: {
          userId,
          title: job.title, company: job.company, companyLogo: job.companyLogo,
          location: job.location, salary: job.salary, description: job.description,
          shortDescription: job.shortDescription, url: job.url, source,
          tags: job.tags, remote: job.remote, seniority: job.seniority,
        },
      });
      const diff = result.updatedAt.getTime() - result.createdAt.getTime();
      if (diff < 1000) newJobs++;
    } catch (error) {
      errors.push(`Error: ${job.title}: ${error}`);
    }
  }

  await prisma.scrapeLog.create({
    data: { userId, source, jobsFound: jobs.length, newJobs, errors: errors.length > 0 ? errors.join("\n") : null },
  });

  return { source, jobsFound: jobs.length, newJobs, errors: errors.length > 0 ? errors.join("\n") : undefined };
}

const SCRAPERS: Record<Source, (() => Promise<ScrapedJob[]>) | null> = {
  [Source.REMOTEOK]: scrapeRemoteOK,
  [Source.WEWORKREMOTELY]: scrapeWeWorkRemotely,
  [Source.ARBEITNOW]: scrapeArbeitnow,
  [Source.REMOTIVE]: scrapeRemotive,
  [Source.HIMALAYAS]: scrapeHimalayas,
  [Source.JOBICY]: scrapeJobicy,
  [Source.THEMUSE]: scrapeTheMuse,
  [Source.MANUAL]: null,
};

const SCRAPER_SOURCES: Source[] = [
  Source.REMOTEOK,
  Source.WEWORKREMOTELY,
  Source.ARBEITNOW,
  Source.REMOTIVE,
  Source.HIMALAYAS,
  Source.JOBICY,
  Source.THEMUSE,
];

export async function runAllScrapers(opts: { sources?: Source[]; userId: string }): Promise<ScrapeResult[]> {
  console.log("🔍 Starting scrape...\n");
  const results: ScrapeResult[] = [];
  const sources = opts.sources ?? SCRAPER_SOURCES;

  for (const source of sources) {
    const scraper = SCRAPERS[source];
    if (!scraper) continue;

    console.log(`📡 ${source}...`);
    try {
      const jobs = await scraper();
      console.log(`   Found: ${jobs.length}`);
      results.push(await saveJobs(jobs, source, opts.userId));
    } catch (error) {
      console.error(`   Error: ${error}`);
      await prisma.scrapeLog.create({
        data: { userId: opts.userId, source, jobsFound: 0, newJobs: 0, errors: String(error) },
      });
      results.push({ source, jobsFound: 0, newJobs: 0, errors: String(error) });
    }
  }

  console.log("\n✅ Done!");
  return results;
}
