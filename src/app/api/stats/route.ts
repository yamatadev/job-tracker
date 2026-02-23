import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalJobs, newJobs, savedJobs, appliedJobs, interviewJobs, bySource, recentLogs] = await Promise.all([
    prisma.job.count({ where: { userId: user.userId } }),
    prisma.job.count({ where: { userId: user.userId, status: "NEW" } }),
    prisma.job.count({ where: { userId: user.userId, status: "SAVED" } }),
    prisma.job.count({ where: { userId: user.userId, status: "APPLIED" } }),
    prisma.job.count({ where: { userId: user.userId, status: "INTERVIEW" } }),
    prisma.job.groupBy({ where: { userId: user.userId }, by: ["source"], _count: { id: true } }),
    prisma.scrapeLog.findMany({ where: { userId: user.userId }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({
    totalJobs, newJobs, savedJobs, appliedJobs, interviewJobs,
    bySource: bySource.map((s) => ({ source: s.source, count: s._count.id })),
    recentLogs,
  });
}
