import { runAllScrapers } from "../src/lib/scrapers";

async function main() {
  const userId = process.env.SCRAPE_USER_ID;
  if (!userId) throw new Error("SCRAPE_USER_ID is required");
  const results = await runAllScrapers({ userId });
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
