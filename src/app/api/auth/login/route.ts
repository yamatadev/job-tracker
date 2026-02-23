import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { getJwtSecret } from "@/lib/auth";
import { getClientId, rateLimit } from "@/lib/rate-limit";

const SECRET = getJwtSecret();

export async function POST(request: NextRequest) {
  const ip = getClientId(request);
  const limit = rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
