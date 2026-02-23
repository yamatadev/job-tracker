import { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

export function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : request.ip || "unknown";
  return ip || "unknown";
}

export function rateLimit(key: string, opts: { limit: number; windowMs: number }) {
  const time = now();
  const bucket = buckets.get(key);

  if (!bucket || time > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: time + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, resetAt: time + opts.windowMs };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count, resetAt: bucket.resetAt };
}
