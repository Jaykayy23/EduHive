import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync(
  new URL("../app/(main)/home/page.tsx", import.meta.url),
  "utf8",
);
const sidebar = readFileSync(
  new URL("../components/TrendsSidebar.tsx", import.meta.url),
  "utf8",
);
const topics = readFileSync(
  new URL("../components/TrendingTopics.tsx", import.meta.url),
  "utf8",
);

test("trending topics are available in the compact mobile home layout", () => {
  assert.match(home, /<TrendingTopics variant="mobile" \/>/);
  assert.match(topics, /<ScrollBar orientation="horizontal" \/>/);
  assert.match(topics, /LIMIT 5/);
});

test("the large-screen trends sidebar scrolls within the viewport", () => {
  assert.match(sidebar, /max-h-\[calc\(100svh-6rem\)\]/);
  assert.match(sidebar, /overflow-y-auto/);
  assert.match(sidebar, /overscroll-contain/);
});
