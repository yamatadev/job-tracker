import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { JobUpdateSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = JobUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { status, notes } = parsed.data;

  const existing = await prisma.job.findFirst({ where: { id, userId: user.userId } });
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const nextStatus = status ?? existing.status;
  const job = await prisma.job.update({
    where: { id },
    data: { status: nextStatus, notes, appliedAt: nextStatus === "APPLIED" ? new Date() : undefined },
  });

  return NextResponse.json(job);
}
