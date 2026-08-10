import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export interface RateLimitPolicy {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
  now?: Date;
}
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: Date;
}

export function buildRateLimitKey(namespace: string, identifier: string) {
  return createHash("sha256")
    .update(`${namespace}:${identifier}`)
    .digest("hex");
}

/**
 * Claims a fixed-window request slot using a single Postgres upsert. The
 * existing AuthEmailRateLimit table is intentionally reused as a generic,
 * deployment-wide rate-limit bucket so serverless instances share state.
 */
export async function claimRateLimit({
  namespace,
  identifier,
  limit,
  windowMs,
  now = new Date(),
}: RateLimitPolicy): Promise<RateLimitResult> {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error("Rate-limit policy must have a positive integer limit");
  }
  if (!Number.isSafeInteger(windowMs) || windowMs < 1_000) {
    throw new Error("Rate-limit window must be at least one second");
  }

  const key = buildRateLimitKey(namespace, identifier);
  const windowCutoff = new Date(now.getTime() - windowMs);
  const rows = await prisma.$queryRaw<
    Array<{ requestCount: number; windowStartedAt: Date }>
  >`
    INSERT INTO "AuthEmailRateLimit"
      ("key", "windowStartedAt", "requestCount", "updatedAt")
    VALUES
      (${key}, ${now}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "windowStartedAt" = CASE
        WHEN "AuthEmailRateLimit"."windowStartedAt" <= ${windowCutoff}
          THEN ${now}
        ELSE "AuthEmailRateLimit"."windowStartedAt"
      END,
      "requestCount" = CASE
        WHEN "AuthEmailRateLimit"."windowStartedAt" <= ${windowCutoff}
          THEN 1
        ELSE "AuthEmailRateLimit"."requestCount" + 1
      END,
      "updatedAt" = ${now}
    RETURNING "requestCount", "windowStartedAt"
  `;

  const requestCount = rows[0]?.requestCount ?? limit + 1;
  const windowStartedAt = rows[0]?.windowStartedAt ?? now;
  const resetAt = new Date(windowStartedAt.getTime() + windowMs);

  return {
    allowed: requestCount <= limit,
    limit,
    remaining: Math.max(0, limit - requestCount),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((resetAt.getTime() - now.getTime()) / 1_000),
    ),
    resetAt,
  };
}

type HeaderReader = Pick<Headers, "get">;

export async function getRequestIp(providedHeaders?: HeaderReader) {
  const requestHeaders = providedHeaders ?? (await headers());
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip =
    requestHeaders.get("x-real-ip")?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    "unknown";

  return ip.slice(0, 128);
}
