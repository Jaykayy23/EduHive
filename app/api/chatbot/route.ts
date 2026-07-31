import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  detectSubject,
  EDUHIVE_TUTOR_SYSTEM_PROMPT,
  getTutorModeInstructions,
  tutorChatRequestSchema,
} from "@/lib/edu-tutor";
import { validateRequest } from "@/lib/auth-server";
import { checkTutorRateLimit } from "@/lib/tutor-rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_TIMEOUT_MS = 25_000;
const DEFAULT_NVIDIA_MODEL = "deepseek-ai/deepseek-v4-pro";
const DEFAULT_MAX_TOKENS = 1_500;

type NvidiaResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getModelResponseText(response: NvidiaResponse): string | null {
  const text = response.choices?.[0]?.message?.content?.trim();

  return text || null;
}

function getMaxTokens(): number {
  const configured = Number.parseInt(process.env.NVIDIA_MAX_TOKENS ?? "", 10);
  return Number.isSafeInteger(configured) && configured > 0
    ? configured
    : DEFAULT_MAX_TOKENS;
}

export async function POST(request: NextRequest) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkTutorRateLimit(user.id);
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
      NVIDIA_TIMEOUT_MS,
    );

    try {
      const nvidiaResponse = await fetch(NVIDIA_CHAT_COMPLETIONS_URL, {
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
              content: `${EDUHIVE_TUTOR_SYSTEM_PROMPT}\n\nSelected learning mode: ${body.mode}\n${getTutorModeInstructions(body.mode)}`,
            },
            ...body.messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
          temperature: 1,
          top_p: 0.95,
          max_tokens: getMaxTokens(),
          chat_template_kwargs: { thinking: false },
          stream: false,
        }),
      });

      if (!nvidiaResponse.ok) {
        console.error("Tutor provider request failed", {
          status: nvidiaResponse.status,
          model,
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

      const response = getModelResponseText(
        (await nvidiaResponse.json()) as NvidiaResponse,
      );
      if (!response) {
        console.error("Tutor provider returned no usable response");
        return NextResponse.json(
          {
            error:
              "The tutor could not produce a response. Please rephrase and try again.",
          },
          { status: 502 },
        );
      }

      const finalQuestion = body.messages.at(-1)?.content ?? "";
      return NextResponse.json({
        response,
        mode: body.mode,
        subject: detectSubject(finalQuestion),
        timestamp: new Date().toISOString(),
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
