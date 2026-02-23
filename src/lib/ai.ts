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
