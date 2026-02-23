import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { JobStatus, Seniority, Source } from "@prisma/client";

export const dynamic = "force-dynamic";

const DATE_RANGE_DAYS: Record<string, number> = { "1d": 1, "3d": 3, "7d": 7, "30d": 30 };

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get("status") as JobStatus | null;
  const source = sp.get("source") as Source | null;
  const seniority = sp.get("seniority") as Seniority | null;
  const search = sp.get("search");
  const dateRange = sp.get("dateRange");
  const page = parseInt(sp.get("page") || "1");
  const limit = parseInt(sp.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (seniority) where.seniority = seniority;
  if (dateRange && DATE_RANGE_DAYS[dateRange]) {
    const since = new Date();
    since.setDate(since.getDate() - DATE_RANGE_DAYS[dateRange]);
    where.createdAt = { gte: since };
  }
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

export async function DELETE(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") as Source | null;
  if (!source) return NextResponse.json({ error: "source required" }, { status: 400 });
  const { count } = await prisma.job.deleteMany({ where: { source } });
  return NextResponse.json({ deleted: count });
}