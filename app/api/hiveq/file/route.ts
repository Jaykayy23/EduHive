import { NextRequest } from "next/server";
import { z } from "zod";
import {
  authorizeHiveqRequest,
  relayHiveqResponse,
  requestHiveq,
} from "@/lib/hiveq-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_FILE_BYTES + 128 * 1024;
const allowedFileTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const distributionSchema = z
  .object({
    mcq: z.number().min(0).max(1),
    true_false: z.number().min(0).max(1),
    fill_in: z.number().min(0).max(1),
  })
  .refine(
    (value) => Math.abs(value.mcq + value.true_false + value.fill_in - 1) <= 0.001,
    { message: "Question percentages must sum to 1.0" },
  );

export async function POST(request: NextRequest) {
  const access = await authorizeHiveqRequest(request);
  if (access.response) return access.response;

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_MULTIPART_BYTES) {
    return Response.json(
      { detail: "File exceeds the 10 MB upload limit." },
      { status: 413 },
    );
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!(file instanceof File)) {
      return Response.json({ detail: "A file is required." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { detail: "File exceeds the 10 MB upload limit." },
        { status: 413 },
      );
    }
    if (!allowedFileTypes.has(file.type)) {
      return Response.json(
        { detail: "Only PDF, DOCX, and text files are supported." },
        { status: 400 },
      );
    }

    const totalQuestions = Number(incoming.get("total_questions") ?? 10);
    if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 50) {
      return Response.json(
        { detail: "Question count must be between 1 and 50." },
        { status: 400 },
      );
    }

    const rawDistribution = incoming.get("question_distribution_json");
    if (typeof rawDistribution !== "string" || rawDistribution.length > 500) {
      return Response.json(
        { detail: "Invalid question distribution." },
        { status: 400 },
      );
    }
    const distribution = distributionSchema.safeParse(JSON.parse(rawDistribution));
    if (!distribution.success) {
      return Response.json(
        { detail: distribution.error.issues[0]?.message ?? "Invalid question distribution." },
        { status: 400 },
      );
    }

    const upstreamForm = new FormData();
    upstreamForm.set("file", file, file.name.slice(0, 255));
    upstreamForm.set("total_questions", String(totalQuestions));
    upstreamForm.set("question_distribution_json", JSON.stringify(distribution.data));

    const upstream = await requestHiveq("/generate-from-file/", {
      method: "POST",
      body: upstreamForm,
    });
    return relayHiveqResponse(upstream);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { detail: "Invalid question distribution." },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.name === "AbortError") {
      return Response.json(
        { detail: "Quiz generation timed out. Please try again." },
        { status: 504 },
      );
    }
    console.error("HiveQ file proxy failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      { detail: "Quiz generation is temporarily unavailable." },
      { status: 503 },
    );
  }
}
