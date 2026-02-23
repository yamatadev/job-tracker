import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import { summarizeResumeWithHighlights } from "@/lib/ai";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const applyToSummary = form.get("applyToSummary") === "true";
  const generateSummary = form.get("generateSummary") === "true";
  const previewOnly = form.get("preview") === "true";
  const summaryLength =
    (form.get("summaryLength") as "short" | "medium" | "long" | null) || "medium";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only PDF or DOCX is supported" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extracted = "";
  try {
    if (file.type === "application/pdf") {
      const res = await pdf(buffer);
      extracted = res.text || "";
    } else {
      const res = await mammoth.extractRawText({ buffer });
      extracted = res.value || "";
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 400 });
  }

  const resumeText = normalizeText(extracted);
  if (!resumeText) {
    return NextResponse.json({ error: "No text found in document" }, { status: 400 });
  }

  const data: Record<string, unknown> = {
    resumeText,
    resumeFileName: file.name,
    resumeMime: file.type,
    resumeUpdatedAt: new Date(),
  };

  if (applyToSummary) {
    data.summary = resumeText.slice(0, 4000);
  } else if (generateSummary) {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    const { summary, highlights } = await summarizeResumeWithHighlights(resumeText, summaryLength);
    data.summary = summary.slice(0, 4000);
    data.resumeHighlights = highlights;
  }

  if (previewOnly) {
    return NextResponse.json({
      preview: {
        summary: data.summary || "",
        highlights: (data.resumeHighlights as string[]) || [],
      },
      extractedText: resumeText,
    });
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.userId },
    create: { userId: user.userId, summary: resumeText.slice(0, 4000), ...data },
    update: data,
  });

  return NextResponse.json({
    profile,
    extractedText: resumeText,
  });
}
