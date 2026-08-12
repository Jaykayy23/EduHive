import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const suggestions = readFileSync(
  new URL("../lib/user-suggestions.ts", import.meta.url),
  "utf8",
);
const home = readFileSync(
  new URL("../app/(main)/home/page.tsx", import.meta.url),
  "utf8",
);
const discoverRoute = readFileSync(
  new URL("../app/api/users/suggestions/route.ts", import.meta.url),
  "utf8",
);
const discoverPage = readFileSync(
  new URL("../app/(main)/people/page.tsx", import.meta.url),
  "utf8",
);
const menu = readFileSync(
  new URL("../app/(main)/MenuBar.tsx", import.meta.url),
  "utf8",
);

test("home suggestions are capped and ordered deterministically", () => {
  assert.match(suggestions, /HOME_SUGGESTION_LIMIT = 5/);
  assert.match(
    suggestions,
    /orderBy: \[\{ createdAt: "desc" \}, \{ id: "desc" \}\]/,
  );
  assert.match(suggestions, /take: limit \+ 1/);
  assert.match(suggestions, /users\.slice\(0, limit\)/);
});

test("mobile home is feed-first and discovery has a dedicated destination", () => {
  assert.doesNotMatch(home, /WhoToFollow/);
  assert.doesNotMatch(home, /TrendingTopics/);
  assert.match(home, /<PostEditor \/>[\s\S]*<HomePageContent \/>/);
  assert.match(discoverPage, /<TabsTrigger value="people">/);
  assert.match(discoverPage, /<PeopleDiscovery \/>/);
  assert.match(menu, /href="\/people"/);
  assert.match(menu, /label="Discover"/);
});

test("discover suggestions require authentication and use bounded pages", () => {
  assert.match(suggestions, /DISCOVER_SUGGESTION_PAGE_SIZE = 20/);
  assert.match(discoverRoute, /status: 401/);
  assert.match(discoverRoute, /DISCOVER_SUGGESTION_PAGE_SIZE/);
});
