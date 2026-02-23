import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { CoverLetterSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = CoverLetterSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "jobId required" }, { status: 400 });
    const { jobId } = parsed.data;
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.userId }, include: { coverLetter: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.coverLetter) return NextResponse.json(job.coverLetter);

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.userId } });
    if (!profile) return NextResponse.json({ error: "Candidate profile not configured", code: "PROFILE_MISSING" }, { status: 400 });
    const candidateSummary =
      profile.summary?.trim() ||
      profile.resumeText?.trim();
    if (!candidateSummary) {
      return NextResponse.json({ error: "Candidate profile not configured", code: "PROFILE_MISSING" }, { status: 400 });
    }

    const content = await generateCoverLetter({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      candidateSummary: candidateSummary.slice(0, 4000),
    });
    const coverLetter = await prisma.coverLetter.create({ data: { content, jobId: job.id, userId: user.userId } });
    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
