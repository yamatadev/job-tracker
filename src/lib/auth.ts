import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export interface AuthUser {
  userId: string;
  email?: string;
  name?: string;
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const userId = payload.userId ? String(payload.userId) : "";
    if (!userId) return null;
    return {
      userId,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
    };
  } catch {
    return null;
  }
}
