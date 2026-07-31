const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 12

const requestsByUser = new Map<string, number[]>()

/**
 * A small per-instance guard against accidental or abusive bursts. Deploy a
 * shared rate limiter (for example Redis) before relying on this across
 * multiple serverless instances.
 */
export function checkTutorRateLimit(userId: string, now = Date.now()) {
  const windowStart = now - WINDOW_MS
  const recentRequests = (requestsByUser.get(userId) ?? []).filter((time) => time > windowStart)

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    requestsByUser.set(userId, recentRequests)
    return { allowed: false, retryAfterSeconds: Math.ceil((recentRequests[0] - windowStart) / 1_000) }
  }

  recentRequests.push(now)
  requestsByUser.set(userId, recentRequests)
  return { allowed: true, retryAfterSeconds: 0 }
}
