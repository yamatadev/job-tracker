import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

interface Input {
  jobTitle: string;
  company: string;
  jobDescription: string;
  candidateSummary: string;
}

function stripThinkBlocks(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export async function generateCoverLetter({
  jobTitle,
  company,
  jobDescription,
  candidateSummary,
}: Input): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a senior technical recruiter and career coach who writes exceptional cover letters.
Rules:
- 4 tight paragraphs, 80-100 words each
- Paragraph 1: Hook — name the exact role, company, and ONE strongest match from the candidate's background
- Paragraph 2: Technical match — cite 2-3 specific requirements from the job description and map them to the candidate's real experience
- Paragraph 3: Business value + remote-readiness — highlight business results, English fluency, async/international experience
- Paragraph 4: CTA — one sentence expressing enthusiasm + availability
- Never use generic filler phrases ("I am writing to express...", "I believe I would be a great fit")
- Write in American English, confident and direct tone
- Output only the cover letter text, no subject line, no <think> tags, no extra commentary`,
      },
      {
        role: "user",
        content: `Role: ${jobTitle} at ${company}

Key requirements extracted from job description:
${jobDescription.slice(0, 2000)}

Candidate profile:
${candidateSummary}`,
      },
    ],
    max_tokens: 1200,
    temperature: 0.6,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw) throw new Error("Model returned an empty response");
  return raw;
}

export async function summarizeResume(resumeText: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a senior technical recruiter. Summarize the candidate resume into 120-180 words in American English. " +
          "Focus on role, years of experience, key skills, measurable achievements, and domain expertise. " +
          "Use 1 short paragraph, no bullets, no headings, no filler, no first-person. Output only the summary text.",
      },
      {
        role: "user",
        content: resumeText.slice(0, 6000),
      },
    ],
    max_tokens: 350,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw) throw new Error("Model returned an empty response");
  return raw.trim();
}

export async function summarizeResumeWithHighlights(
  resumeText: string,
  length: "short" | "medium" | "long"
): Promise<{ summary: string; highlights: string[] }> {
  const wordRange =
    length === "short" ? "80-120" : length === "long" ? "180-240" : "120-180";

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a senior technical recruiter. Return STRICT JSON with keys: summary (string) and highlights (array of 5 strings). " +
          `Summary must be ${wordRange} words, 1 paragraph, American English, no bullets, no headings, no first-person. ` +
          "Highlights must be 5 concise bullet phrases focusing on skills and measurable achievements. " +
          "Output JSON only, no markdown, no extra text.",
      },
      {
        role: "user",
        content: resumeText.slice(0, 6000),
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  if (!raw) throw new Error("Model returned an empty response");
  try {
    const parsed = JSON.parse(raw);
    const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
    const highlights = Array.isArray(parsed.highlights)
      ? parsed.highlights.map((h) => String(h).trim()).filter(Boolean).slice(0, 5)
      : [];
    if (!summary) throw new Error("Invalid summary");
    return { summary, highlights };
  } catch {
    return { summary: raw.trim(), highlights: [] };
  }
}
