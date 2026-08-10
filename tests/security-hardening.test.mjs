import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("HiveQ uses authenticated same-origin proxy routes", () => {
  const page = source("app/(main)/hiveq/page.tsx");
  const proxy = source("lib/hiveq-server.ts");
  const backend = source("ml-backend/app/main.py");

  assert.match(page, /fetch\("\/api\/hiveq\/text"/);
  assert.match(page, /fetch\("\/api\/hiveq\/file"/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_QUESTGEN_API_URL/);
  assert.match(proxy, /validateRequest\(\)/);
  assert.match(proxy, /"X-HiveQ-API-Key": internalKey/);
  assert.match(proxy, /claimRateLimit/);
  assert.match(backend, /dependencies=\[Depends\(require_internal_api_key\)\]/);
});

test("document parsing is pinned and bounded", () => {
  const requirements = source("ml-backend/requirements.txt");
  const parser = source("ml-backend/app/utils/file_parser.py");

  assert.match(requirements, /pypdf==6\.15\.0/);
  assert.match(parser, /_detect_type\(file_content\)/);
  assert.match(parser, /max_pdf_pages/);
  assert.match(parser, /max_docx_uncompressed_bytes/);
  assert.match(parser, /multiprocessing\.get_context\("spawn"\)/);
  assert.match(parser, /process\.terminate\(\)/);
  assert.match(parser, /resource\.setrlimit/);
  assert.doesNotMatch(parser, /detail=f"Error processing file:/);
});

test("abuse controls use a shared database bucket", () => {
  const rateLimit = source("lib/rate-limit.ts");
  const login = source("app/(auth)/login/actions.ts");
  const signup = source("app/(auth)/signup/actions.ts");
  const tutor = source("lib/tutor-rate-limit.ts");

  assert.match(rateLimit, /INSERT INTO "AuthEmailRateLimit"/);
  assert.match(rateLimit, /ON CONFLICT \("key"\) DO UPDATE/);
  assert.match(login, /namespace: "login:ip"/);
  assert.match(login, /namespace: "login:account"/);
  assert.match(signup, /namespace: "signup:ip"/);
  assert.match(tutor, /claimRateLimit/);
  assert.doesNotMatch(tutor, /new Map/);
});

test("media and comment ownership are enforced from server data", () => {
  const schema = source("prisma/schema.prisma");
  const uploads = source("app/api/uploadthing/core.ts");
  const posts = source("components/posts/editor/actions.ts");
  const comments = source("components/comments/actions.ts");

  assert.match(schema, /ownerId String\?/);
  assert.match(uploads, /ownerId: metadata\.userId/);
  assert.match(posts, /ownerId: user\.id/);
  assert.match(posts, /postId: null/);
  assert.match(comments, /tx\.post\.findUnique/);
  assert.match(comments, /recipientId: post\.userId/);
  assert.doesNotMatch(comments, /PostData/);
});

test("high-cost and user-generated fields have maximum lengths", () => {
  const validation = source("lib/validation.ts");

  assert.match(validation, /Email must be at most 254 characters/);
  assert.match(validation, /Password must be at most 128 characters/);
  assert.match(validation, /Post must be at most 10,000 characters/);
  assert.match(validation, /Comment must be at most 2,000 characters/);
});
