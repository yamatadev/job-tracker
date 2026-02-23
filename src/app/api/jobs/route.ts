import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Source } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { JobQuerySchema, parseSearchParams } from "@/lib/validators";

export const dynamic = "force-dynamic";

const DATE_RANGE_DAYS: Record<string, number> = { "1d": 1, "3d": 3, "7d": 7, "30d": 30 };

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const parsed = JobQuerySchema.safeParse(parseSearchParams(sp));
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  const { status, source, seniority, search, dateRange, page, limit } = parsed.data;

  const where: Record<string, unknown> = { userId: user.userId };
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
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sourceRaw = request.nextUrl.searchParams.get("source") || "";
  if (!Object.prototype.hasOwnProperty.call(Source, sourceRaw)) {
    return NextResponse.json({ error: "source required" }, { status: 400 });
  }
  const source = Source[sourceRaw as keyof typeof Source];
  const { count } = await prisma.job.deleteMany({ where: { source, userId: user.userId } });
  return NextResponse.json({ deleted: count });
}
