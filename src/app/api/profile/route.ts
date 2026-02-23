import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ProfileSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.userId },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.userId },
    create: { userId: user.userId, summary: parsed.data.summary },
    update: { summary: parsed.data.summary },
  });

  return NextResponse.json({ profile });
}
