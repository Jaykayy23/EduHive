import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(
  new URL("../app/api/notifications/mark-as-read/route.ts", import.meta.url),
  "utf8",
);

test("marking notifications read uses the production Prisma client", () => {
  assert.match(route, /import prisma from "@\/lib\/prisma"/);
  assert.match(route, /await prisma\.notification\.updateMany/);
  assert.doesNotMatch(route, /prisma\?\./);
});
