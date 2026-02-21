import { runAllScrapers } from "@/lib/scrapers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const results = await runAllScrapers();
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}