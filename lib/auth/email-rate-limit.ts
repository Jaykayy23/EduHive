import "server-only";

import {
  buildRateLimitKey,
  claimRateLimit,
  getRequestIp,
} from "@/lib/rate-limit";

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
  return buildRateLimitKey(`${kind}:${scope}`, identifier);
}

export async function allowAuthEmailRequest(kind: AuthEmailKind) {
  const ip = await getRequestIp();
  const result = await claimRateLimit({
    namespace: `${kind}:ip`,
    identifier: ip,
    limit: IP_REQUEST_LIMIT,
    windowMs: IP_WINDOW_MS,
  });
  return result.allowed;
}

export async function allowAuthEmailForAccount(
  kind: AuthEmailKind,
  userId: string,
) {
  const minuteLimit = await claimRateLimit({
    namespace: `${kind}:account-minute`,
    identifier: userId,
    limit: 1,
    windowMs: ACCOUNT_MINUTE_WINDOW_MS,
  });
  if (!minuteLimit.allowed) {
    return false;
  }

  const hourlyLimit = await claimRateLimit({
    namespace: `${kind}:account-hour`,
    identifier: userId,
    limit: ACCOUNT_HOURLY_LIMIT,
    windowMs: ACCOUNT_HOUR_WINDOW_MS,
  });
  return hourlyLimit.allowed;
}

export async function waitForUniformAuthEmailResponse(startedAt: number) {
  const remaining = MINIMUM_RESPONSE_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
