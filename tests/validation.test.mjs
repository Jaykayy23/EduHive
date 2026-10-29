import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { zodResolver } from "@hookform/resolvers/zod";

// Use the real schemas; resolve Next aliases for the plain Node test runner.
async function loadSchema(relative) {
  const file = new URL(relative, import.meta.url);
  const source = await readFile(file, "utf8");
  const resolved = source.replace(
    /from ["']([^"']+)["']/g,
    (original, name) => {
      if (name === "zod") return `from "${import.meta.resolve("zod")}"`;
      if (name.startsWith("@/"))
        return `from "${new URL(`../${name.slice(2)}.ts`, import.meta.url).href}"`;
      if (name.startsWith("./"))
        return `from "${new URL(`${name}.ts`, file).href}"`;
      return original;
    },
  );
  const javascript = ts.transpileModule(resolved, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
}

const schemas = await loadSchema("../lib/validation.ts");
const tutor = await loadSchema("../lib/edu-tutor.ts");
const chats = await loadSchema("../lib/chat-session-schema.ts");

test("signup schema and form resolver preserve field errors and valid values", async () => {
  const resolve = zodResolver(schemas.signUpSchema);
  const options = {
    criteriaMode: "firstError",
    fields: {},
    shouldUseNativeValidation: false,
  };
  const valid = {
    username: "sample_user",
    email: "sample@example.com",
    password: "example-password",
  };
  const success = await resolve(valid, {}, options);
  assert.deepEqual(success.errors, {});
  assert.deepEqual(success.values, valid);
  const failure = await resolve(
    { username: "x", email: "invalid", password: "short" },
    {},
    options,
  );
  assert.ok(failure.errors.username.message);
  assert.ok(failure.errors.email.message);
  assert.ok(failure.errors.password.message);
});

test("post validation bounds uploads and text while deduplicating media", () => {
  assert.deepEqual(
    schemas.createPostSchema.parse({
      content: " Notes ",
      mediaIds: ["a", "a"],
    }),
    { content: "Notes", mediaIds: ["a"] },
  );
  assert.equal(
    schemas.createPostSchema.safeParse({
      content: "x".repeat(10001),
      mediaIds: [],
    }).success,
    false,
  );
  assert.equal(
    schemas.createPostSchema.safeParse({
      content: "notes",
      mediaIds: Array(6).fill("a"),
    }).success,
    false,
  );
});

test("tutor validation enforces conversation roles, message caps and modes", () => {
  assert.equal(
    tutor.tutorChatRequestSchema.parse({
      messages: [{ role: "user", content: "Explain cells" }],
    }).mode,
    "explain",
  );
  for (const payload of [
    { messages: [{ role: "assistant", content: "hello" }] },
    {
      messages: [
        { role: "user", content: "a" },
        { role: "user", content: "b" },
      ],
    },
    { messages: [{ role: "user", content: "x".repeat(4001) }] },
    { mode: "unrecognized", messages: [{ role: "user", content: "hello" }] },
  ])
    assert.equal(
      tutor.tutorChatRequestSchema.safeParse(payload).success,
      false,
    );
});

test("stored chat validation coerces timestamps and requires study-source pairs", () => {
  const payload = {
    id: "123e4567-e89b-42d3-a456-426614174000",
    title: "Example",
    messages: [
      {
        id: "123e4567-e89b-42d3-a456-426614174001",
        content: "Sample",
        isUser: true,
        timestamp: "2026-10-29T00:00:00Z",
      },
    ],
  };
  assert.ok(
    chats.chatSessionPayloadSchema.parse(payload).messages[0]
      .timestamp instanceof Date,
  );
  assert.equal(
    chats.chatSessionPayloadSchema.safeParse({ ...payload, studyMode: "quiz" })
      .success,
    false,
  );
  assert.equal(
    chats.chatSessionPayloadSchema.safeParse({
      ...payload,
      messages: Array(101).fill(payload.messages[0]),
    }).success,
    false,
  );
});
