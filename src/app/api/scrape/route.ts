import { runAllScrapers } from "@/lib/scrapers";
import { Source } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const sources = body.sources as Source[] | undefined;
    const results = await runAllScrapers(sources);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
