import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalJobs, newJobs, savedJobs, appliedJobs, interviewJobs, bySource, recentLogs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "NEW" } }),
    prisma.job.count({ where: { status: "SAVED" } }),
    prisma.job.count({ where: { status: "APPLIED" } }),
    prisma.job.count({ where: { status: "INTERVIEW" } }),
    prisma.job.groupBy({ by: ["source"], _count: { id: true } }),
    prisma.scrapeLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({
    totalJobs, newJobs, savedJobs, appliedJobs, interviewJobs,
    bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
    recentLogs,
  });
}