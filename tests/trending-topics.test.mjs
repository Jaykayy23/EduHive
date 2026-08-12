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
const discover = readFileSync(
  new URL("../app/(main)/people/page.tsx", import.meta.url),
  "utf8",
);

test("trending topics live in Discover instead of above the mobile feed", () => {
  assert.doesNotMatch(home, /TrendingTopics/);
  assert.match(discover, /<TabsTrigger value="topics">/);
  assert.match(discover, /<TrendingTopics \/>/);
  assert.match(topics, /LIMIT 5/);
});

test("the large-screen trends sidebar scrolls within the viewport", () => {
  assert.match(sidebar, /max-h-\[calc\(100svh-6rem\)\]/);
  assert.match(sidebar, /overflow-y-auto/);
  assert.match(sidebar, /overscroll-contain/);
});
