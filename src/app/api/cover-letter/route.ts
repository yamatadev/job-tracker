import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai";
import { CANDIDATE_SUMMARY } from "@/lib/candidate-profile";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { coverLetter: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.coverLetter) return NextResponse.json(job.coverLetter);

    const content = await generateCoverLetter({
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
      candidateSummary: CANDIDATE_SUMMARY,
    });
    const coverLetter = await prisma.coverLetter.create({ data: { content, jobId: job.id } });
    return NextResponse.json(coverLetter);
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
