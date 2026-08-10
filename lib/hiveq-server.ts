import "server-only";

import { validateRequest } from "@/lib/auth-server";
import { getQuestgenUrl } from "@/lib/questgen";
import { claimRateLimit, getRequestIp } from "@/lib/rate-limit";

const HIVEQ_TIMEOUT_MS = 55_000;
const HIVEQ_USER_LIMIT = 10;
const HIVEQ_IP_LIMIT = 30;
const HIVEQ_WINDOW_MS = 10 * 60 * 1_000;

export async function authorizeHiveqRequest(request: Request): Promise<
  | { userId: string; response: null }
  | { userId: null; response: Response }
> {
  const { user } = await validateRequest();
  if (!user) {
    return {
      userId: null,
      response: Response.json({ detail: "Unauthorized" }, { status: 401 }),
    };
  }

  const userLimit = await claimRateLimit({
    namespace: "hiveq:user",
    identifier: user.id,
    limit: HIVEQ_USER_LIMIT,
    windowMs: HIVEQ_WINDOW_MS,
  });
  const ipLimit = await claimRateLimit({
    namespace: "hiveq:ip",
    identifier: await getRequestIp(request.headers),
    limit: HIVEQ_IP_LIMIT,
    windowMs: HIVEQ_WINDOW_MS,
  });

  if (!userLimit.allowed || !ipLimit.allowed) {
    const retryAfterSeconds = Math.max(
      userLimit.retryAfterSeconds,
      ipLimit.retryAfterSeconds,
    );
    return {
      userId: null,
      response: Response.json(
        { detail: "Quiz generation limit reached. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        },
      ),
    };
  }

  return { userId: user.id, response: null };
}
export async function requestHiveq(path: string, init: RequestInit) {
  const internalKey = process.env.HIVEQ_INTERNAL_API_KEY?.trim();
  if (!internalKey || internalKey.length < 32) {
    throw new Error("HIVEQ_INTERNAL_API_KEY is not configured");
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), HIVEQ_TIMEOUT_MS);

  try {
    return await fetch(getQuestgenUrl(path), {
      ...init,
      cache: "no-store",
      headers: {
        ...init.headers,
        "X-HiveQ-API-Key": internalKey,
      },
      signal: abortController.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function relayHiveqResponse(upstream: Response) {
  const responseText = await upstream.text();
  if (upstream.ok) {
    return new Response(responseText, {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  const passThroughStatuses = new Set([400, 408, 413, 422, 429]);
  const status = passThroughStatuses.has(upstream.status)
    ? upstream.status
    : upstream.status === 503
      ? 503
      : 502;
  let detail = "Quiz generation is temporarily unavailable.";

  if (passThroughStatuses.has(upstream.status)) {
    try {
      const parsed = JSON.parse(responseText) as { detail?: unknown };
      if (typeof parsed.detail === "string") {
        detail = parsed.detail.slice(0, 300);
      }
    } catch {}
  }

  return Response.json(
    { detail },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
