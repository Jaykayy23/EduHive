import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

type AuthEmailKind = "password-reset" | "verification";
type AuthEmailScope = "account-minute" | "account-hour" | "ip";

const ACCOUNT_MINUTE_WINDOW_MS = 60 * 1000;
const ACCOUNT_HOUR_WINDOW_MS = 60 * 60 * 1000;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_REQUEST_LIMIT = 10;
const ACCOUNT_HOURLY_LIMIT = 5;
const MINIMUM_RESPONSE_MS = 400;

export function buildAuthEmailRateLimitKey(
  kind: AuthEmailKind,
  scope: AuthEmailScope,
  identifier: string,
) {
  return createHash("sha256")
    .update(`${kind}:${scope}:${identifier}`)
    .digest("hex");
}

async function getRequestIp() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown";

  return ip.slice(0, 128);
}

async function claimRateLimit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - windowMs);
  const rows = await prisma.$queryRaw<Array<{ requestCount: number }>>`
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
    RETURNING "requestCount"
  `;

  return (rows[0]?.requestCount ?? limit + 1) <= limit;
}

export async function allowAuthEmailRequest(kind: AuthEmailKind) {
  const ip = await getRequestIp();
  return claimRateLimit(
    buildAuthEmailRateLimitKey(kind, "ip", ip),
    IP_REQUEST_LIMIT,
    IP_WINDOW_MS,
  );
}

export async function allowAuthEmailForAccount(
  kind: AuthEmailKind,
  userId: string,
) {
  const minuteAllowed = await claimRateLimit(
    buildAuthEmailRateLimitKey(kind, "account-minute", userId),
    1,
    ACCOUNT_MINUTE_WINDOW_MS,
  );
  if (!minuteAllowed) {
    return false;
  }

  return claimRateLimit(
    buildAuthEmailRateLimitKey(kind, "account-hour", userId),
    ACCOUNT_HOURLY_LIMIT,
    ACCOUNT_HOUR_WINDOW_MS,
  );
}

export async function waitForUniformAuthEmailResponse(startedAt: number) {
  const remaining = MINIMUM_RESPONSE_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
