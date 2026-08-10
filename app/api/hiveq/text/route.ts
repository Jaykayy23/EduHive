import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeHiveqRequest,
  relayHiveqResponse,
  requestHiveq,
} from "@/lib/hiveq-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_JSON_BYTES = 70_000;
const textRequestSchema = z
  .object({
    text_input: z.string().trim().min(150).max(60_000),
    total_questions: z.number().int().min(1).max(50),
    mcq_percentage: z.number().min(0).max(1),
    true_false_percentage: z.number().min(0).max(1),
    fill_in_percentage: z.number().min(0).max(1),
  })
  .refine(
    (value) =>
      Math.abs(
        value.mcq_percentage +
          value.true_false_percentage +
          value.fill_in_percentage -
          1,
      ) <= 0.001,
    { message: "Question percentages must sum to 1.0" },
  );

export async function POST(request: NextRequest) {
  const access = await authorizeHiveqRequest(request);
  if (access.response) return access.response;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_JSON_BYTES) {
    return Response.json(
      { detail: "Study text exceeds the request limit." },
      { status: 413 },
    );
  }

  try {
    const parsed = textRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { detail: parsed.error.issues[0]?.message ?? "Invalid quiz request." },
        { status: 400 },
      );
    }

    const upstream = await requestHiveq("/generate-from-text/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    return relayHiveqResponse(upstream);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ detail: "Invalid JSON request." }, { status: 400 });
    }
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json(
        { detail: "Quiz generation timed out. Please try again." },
        { status: 504 },
      );
    }
    console.error("HiveQ text proxy failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { detail: "Quiz generation is temporarily unavailable." },
      { status: 503 },
    );
  }
}
