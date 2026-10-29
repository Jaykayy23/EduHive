import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { runSmoke } from "../scripts/smoke.mjs";

async function withFixture(demoStatus, check, protection = "redirect") {
  const server = createServer((req, res) => {
    if (req.url === "/") return res.end("EduHive Turn notes into knowledge");
    if (req.url === "/hiveq/demo") {
      res.statusCode = demoStatus;
      if (demoStatus === 302) res.setHeader("location", "/login");
      return res.end("Interactive sample From notes to No account needed");
    }
    if (req.url.startsWith("/api/")) {
      res.statusCode = 401;
      return res.end("Unauthorized");
    }
    if (protection === "stream")
      return res.end(
        '<meta id="__next-page-redirect" http-equiv="refresh" content="1;url=/login"/>',
      );
    if (protection === "exposed") return res.end("Private account content");
    res.writeHead(307, { location: "/login" });
    res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await check(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("smoke exercises public pages and unauthenticated API rejection over HTTP", async () => {
  await withFixture(200, async (base) => {
    const results = await runSmoke(base);
    assert.ok(results.length >= 10);
    assert.ok(results.every((result) => result.passed));
  });
});

test("smoke catches a demo incorrectly redirected to login", async () => {
  await withFixture(302, async (base) => {
    const results = await runSmoke(base);
    assert.equal(
      results.find((result) => result.path === "/hiveq/demo").passed,
      false,
    );
  });
});

test("smoke accepts Next.js streamed login redirects", async () => {
  await withFixture(
    200,
    async (base) => {
      assert.ok((await runSmoke(base)).every((result) => result.passed));
    },
    "stream",
  );
});

test("smoke rejects protected content served without a login redirect", async () => {
  await withFixture(
    200,
    async (base) => {
      assert.equal(
        (await runSmoke(base)).find((result) => result.path === "/home").passed,
        false,
      );
    },
    "exposed",
  );
});
