import { pathToFileURL } from "node:url";

// Anonymous checks only. No signup, provider call, mutation or real user data.
export async function runSmoke(baseUrl) {
  const base = new URL(baseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  ) {
    throw new Error(
      "Use an HTTP(S) origin without credentials, path, query or fragment.",
    );
  }
  const checks = [
    { path: "/", status: 200, content: /EduHive/ },
    { path: "/hiveq/demo", status: 200, content: /Interactive sample/ },
    ...[
      "/home",
      "/hiveq",
      "/chatbot",
      "/messages",
      "/bookmarks",
      "/admin/reports",
    ].map((path) => ({ path, login: true })),
    { path: "/api/hiveq/text", status: 401, method: "POST" },
    { path: "/api/chatbot", status: 401, method: "POST" },
    { path: "/api/messages/unread-count", status: 401 },
  ];
  const results = [];
  for (const check of checks) {
    try {
      const response = await fetch(new URL(check.path, base), {
        redirect: "manual",
        signal: AbortSignal.timeout(30_000),
        ...(check.method
          ? {
              method: check.method,
              headers: { "Content-Type": "application/json" },
              body: "{}",
            }
          : {}),
      });
      const text = await response.text();
      const location = response.headers.get("location");
      // A redirect after streaming starts is carried by Next.js in a meta tag.
      const streamedLogin =
        response.status === 200 &&
        /<meta id="__next-page-redirect" http-equiv="refresh" content="[01];url=\/login"\s*\/?>/.test(
          text,
        );
      const passed = check.login
        ? streamedLogin ||
          ([302, 303, 307, 308].includes(response.status) &&
            location !== null &&
            new URL(location, base).origin === base.origin &&
            new URL(location, base).pathname === "/login")
        : response.status === check.status &&
          (!check.content || check.content.test(text));
      results.push({ path: check.path, passed, status: response.status });
    } catch {
      results.push({ path: check.path, passed: false, status: null });
    }
  }
  return results;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const results = await runSmoke(process.argv[2] ?? "http://127.0.0.1:3000");
    for (const result of results)
      console.log(
        `${result.passed ? "PASS" : "FAIL"} ${result.path} (${result.status ?? "request failed"})`,
      );
    console.log(
      "Anonymous HTTP checks only; signed-in workflows and live providers require separate verification.",
    );
    if (results.some((result) => !result.passed)) process.exitCode = 1;
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Smoke check failed",
    );
    process.exitCode = 1;
  }
}
