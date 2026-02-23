import { z } from "zod";
import { JobStatus, Seniority, Source } from "@prisma/client";

export const JobQuerySchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  source: z.nativeEnum(Source).optional(),
  seniority: z.nativeEnum(Seniority).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  dateRange: z.enum(["1d", "3d", "7d", "30d"]).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const JobUpdateSchema = z.object({
  status: z.nativeEnum(JobStatus).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const ScrapeRequestSchema = z.object({
  sources: z.array(z.nativeEnum(Source)).min(1).max(10).optional(),
});

export const CoverLetterSchema = z.object({
  jobId: z.string().min(1),
});

export const ProfileSchema = z.object({
  summary: z.string().trim().min(50).max(4000),
});

export function parseSearchParams(sp: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of sp.entries()) obj[k] = v;
  return obj;
}
