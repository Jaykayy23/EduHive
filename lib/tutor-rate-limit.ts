import "server-only";

import { claimRateLimit } from "@/lib/rate-limit";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

/**
 * Uses the shared Postgres bucket so limits survive cold starts and apply
 * across every serverless instance.
 */
export function checkTutorRateLimit(userId: string, now = new Date()) {
  return claimRateLimit({
    namespace: "tutor:user",
    identifier: userId,
    limit: MAX_REQUESTS_PER_WINDOW,
    windowMs: WINDOW_MS,
    now,
  });
}
