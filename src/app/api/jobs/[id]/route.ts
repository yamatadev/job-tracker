import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const job = await prisma.job.update({
    where: { id },
    data: { status: body.status, notes: body.notes, appliedAt: body.status === "APPLIED" ? new Date() : undefined },
  });

  return NextResponse.json(job);
}