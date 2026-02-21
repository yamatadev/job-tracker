import { prisma } from "../prisma";
import { scrapeRemoteOK } from "./remoteok";
import { scrapeArbeitnow } from "./arbeitnow";
import { ScrapedJob } from "./types";
import { Source } from "@prisma/client";

interface ScrapeResult { source: Source; jobsFound: number; newJobs: number; errors?: string; }

async function saveJobs(jobs: ScrapedJob[], source: Source): Promise<ScrapeResult> {
  let newJobs = 0;
  const errors: string[] = [];

  for (const job of jobs) {
    try {
      const result = await prisma.job.upsert({
        where: { url: job.url },
        update: { title: job.title, company: job.company, salary: job.salary, description: job.description, tags: job.tags },
        create: {
          title: job.title, company: job.company, companyLogo: job.companyLogo,
          location: job.location, salary: job.salary, description: job.description,
          shortDescription: job.shortDescription, url: job.url, source,
          tags: job.tags, remote: job.remote,
        },
      });
      const diff = result.updatedAt.getTime() - result.createdAt.getTime();
      if (diff < 1000) newJobs++;
    } catch (error) {
      errors.push(`Error: ${job.title}: ${error}`);
    }
  }

  await prisma.scrapeLog.create({
    data: { source, jobsFound: jobs.length, newJobs, errors: errors.length > 0 ? errors.join("\n") : null },
  });

  return { source, jobsFound: jobs.length, newJobs, errors: errors.length > 0 ? errors.join("\n") : undefined };
}

export async function runAllScrapers(): Promise<ScrapeResult[]> {
  console.log("🔍 Starting scrape...\n");
  const results: ScrapeResult[] = [];

  console.log("📡 RemoteOK...");
  const rok = await scrapeRemoteOK();
  console.log(`   Found: ${rok.length}`);
  results.push(await saveJobs(rok, Source.REMOTEOK));

  console.log("📡 Arbeitnow...");
  const abn = await scrapeArbeitnow();
  console.log(`   Found: ${abn.length}`);
  results.push(await saveJobs(abn, Source.ARBEITNOW));

  console.log("\n✅ Done!");
  return results;
}