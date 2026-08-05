import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

function source(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("password login awaits the Next.js cookie store", () => {
  const loginAction = source("app/(auth)/login/actions.ts");

  assert.match(loginAction, /const cookieStore = await cookies\(\)/);
  assert.doesNotMatch(loginAction, /cookies\(\) as unknown/);
});

test("recovery routes are outside the signed-in auth redirect layout", () => {
  assert.equal(
    existsSync(
      new URL(
        "../app/(recovery)/reset-password/[token]/page.tsx",
        import.meta.url,
      ),
    ),
    true,
  );
  assert.equal(
    existsSync(
      new URL("../app/(auth)/reset-password/[token]/page.tsx", import.meta.url),
    ),
    false,
  );
});

test("verification redirects do not put email addresses in URLs", () => {
  const signupAction = source("app/(auth)/signup/actions.ts");
  const loginAction = source("app/(auth)/login/actions.ts");

  assert.doesNotMatch(signupAction, /verify-email\/sent\?email=/);
  assert.doesNotMatch(loginAction, /verify-email\/sent\?email=/);
});

test("public resend actions use shared throttling and uniform results", () => {
  const verificationAction = source("app/(auth)/verify-email/actions.ts");
  const resetAction = source("app/(recovery)/forgot-password/actions.ts");

  assert.match(verificationAction, /allowAuthEmailRequest\("verification"\)/);
  assert.match(resetAction, /allowAuthEmailRequest\("password-reset"\)/);
  assert.doesNotMatch(
    verificationAction,
    /return \{ error: "We could not send the email/,
  );
});
