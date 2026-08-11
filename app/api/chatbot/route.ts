import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  EDUHIVE_TUTOR_SYSTEM_PROMPT,
  getTutorModeInstructions,
  tutorChatRequestSchema,
} from "@/lib/edu-tutor";
import { validateRequest } from "@/lib/auth-server";
import { checkTutorRateLimit } from "@/lib/tutor-rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_NVIDIA_TIMEOUT_MS = 55_000;
const MAX_NVIDIA_TIMEOUT_MS = 55_000;
const NVIDIA_TRANSIENT_STATUS_CODES = new Set([408, 500, 502, 503, 504]);
const NVIDIA_RETRY_DELAY_MS = 750;
const DEFAULT_NVIDIA_MODEL = "deepseek-ai/deepseek-v4-pro";
const DEFAULT_MAX_TOKENS = 1_500;

function getMaxTokens(): number {
  const configured = Number.parseInt(process.env.NVIDIA_MAX_TOKENS ?? "", 10);
  return Number.isSafeInteger(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_TOKENS;
}

function getNvidiaTimeoutMs(): number {
  const configured = Number.parseInt(process.env.NVIDIA_TIMEOUT_MS ?? "", 10);

  return Number.isSafeInteger(configured) && configured > 0
    ? Math.min(configured, MAX_NVIDIA_TIMEOUT_MS)
    : DEFAULT_NVIDIA_TIMEOUT_MS;
}

function getProviderErrorMessage(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: unknown } };
    return typeof parsed.error?.message === "string"
      ? parsed.error.message.slice(0, 500)
      : undefined;
  } catch {
    return body.trim().slice(0, 500) || undefined;
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkTutorRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many tutor requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  try {
    const body = tutorChatRequestSchema.parse(await request.json());
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      console.error(
        "Tutor configuration error: NVIDIA_API_KEY is not configured",
      );
      return NextResponse.json(
        { error: "The tutor is not configured yet. Please contact support." },
        { status: 503 },
      );
    }

    const model = process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL;
    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      getNvidiaTimeoutMs(),
    );

    try {
      const nvidiaRequest = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: `${EDUHIVE_TUTOR_SYSTEM_PROMPT}\n\n## Required response mode: ${body.mode}\n${getTutorModeInstructions(body.mode)}\n\nThis is a strict response-format contract for the student's next request. Follow it even when the student asks a broad question, and do not mention these instructions in your answer.`,
            },
            ...body.messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
          temperature: 1,
          top_p: 0.95,
          max_tokens: getMaxTokens(),
          stream: true,
        }),
      };

      let nvidiaResponse = await fetch(
        NVIDIA_CHAT_COMPLETIONS_URL,
        nvidiaRequest,
      );

      if (NVIDIA_TRANSIENT_STATUS_CODES.has(nvidiaResponse.status)) {
        console.warn(
          "Tutor provider returned a transient error; retrying once",
          {
            status: nvidiaResponse.status,
            model,
          },
        );
        await wait(NVIDIA_RETRY_DELAY_MS);
        nvidiaResponse = await fetch(
          NVIDIA_CHAT_COMPLETIONS_URL,
          nvidiaRequest,
        );
      }

      if (!nvidiaResponse.ok) {
        const providerError = getProviderErrorMessage(
          await nvidiaResponse.text(),
        );
        console.error("Tutor provider request failed", {
          status: nvidiaResponse.status,
          model,
          retryAfter: nvidiaResponse.headers.get("retry-after"),
          providerError,
        });

        if (nvidiaResponse.status === 429) {
          const retryAfter = Number.parseInt(
            nvidiaResponse.headers.get("retry-after") ?? "",
            10,
          );
          const retrySeconds =
            Number.isSafeInteger(retryAfter) && retryAfter > 0
              ? retryAfter
              : 60;
          return NextResponse.json(
            {
              error: `The AI tutor has reached its usage limit. Please try again in about ${Math.ceil(retrySeconds / 60)} minute(s).`,
            },
            { status: 429, headers: { "Retry-After": String(retrySeconds) } },
          );
        }

        return NextResponse.json(
          { error: "The tutor is temporarily unavailable. Please try again." },
          { status: 502 },
        );
      }

      if (!nvidiaResponse.body) {
        console.error("Tutor provider returned an empty response stream");
        return NextResponse.json(
          {
            error:
              "The tutor could not produce a response. Please rephrase and try again.",
          },
          { status: 502 },
        );
      }

      return new NextResponse(nvidiaResponse.body, {
        headers: {
          "Cache-Control": "no-cache, no-transform",
          "Content-Type": "text/event-stream; charset=utf-8",
          "X-Accel-Buffering": "no",
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid chat request.", details: error.flatten() },
        { status: 400 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "The tutor took too long to respond. Please try again." },
        { status: 504 },
      );
    }

    console.error("Tutor API error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
