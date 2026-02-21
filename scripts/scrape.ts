import { runAllScrapers } from "../src/lib/scrapers";

async function main() {
  const results = await runAllScrapers();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });