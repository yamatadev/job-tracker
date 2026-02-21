import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

interface Input { jobTitle: string; company: string; jobDescription: string; candidateSummary: string; }

export async function generateCoverLetter({ jobTitle, company, jobDescription, candidateSummary }: Input): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert career coach. Write compelling, personalized cover letters. Professional but warm. 3-4 paragraphs. Focus on how the candidate's experience relates to the role. Write in English." },
      { role: "user", content: `Write a cover letter for:\n\n**Role:** ${jobTitle} at ${company}\n\n**Job Description:**\n${jobDescription.slice(0, 2000)}\n\n**Candidate:**\n${candidateSummary}` },
    ],
    max_tokens: 1000,
    temperature: 0.7,
  });
  return response.choices[0].message.content || "Error generating cover letter.";
}