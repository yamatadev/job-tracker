import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { JobStatus, Source } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") as JobStatus | null;
  const source = sp.get("source") as Source | null;
  const search = sp.get("search");
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { company: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { coverLetter: true } }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}