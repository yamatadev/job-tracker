import { runAllScrapers } from "@/lib/scrapers";
import { Source } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ScrapeRequestSchema } from "@/lib/validators";
import { getClientId, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ip = getClientId(request);
  const limit = rateLimit(`scrape:${user.userId}:${ip}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many scrape requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = ScrapeRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    const sources = parsed.data.sources as Source[] | undefined;
    const results = await runAllScrapers({ sources, userId: user.userId });
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
