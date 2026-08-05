import assert from "node:assert/strict";
import test from "node:test";

import {
  generateAuthToken,
  getTokenExpiry,
  hashAuthToken,
} from "../lib/auth/tokens.ts";

test("auth tokens are random, fixed-length, and hashed before storage", () => {
  const first = generateAuthToken();
  const second = generateAuthToken();

  assert.match(first, /^[a-f0-9]{64}$/);
  assert.match(second, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
  assert.match(hashAuthToken(first), /^[a-f0-9]{64}$/);
  assert.notEqual(hashAuthToken(first), first);
  assert.equal(hashAuthToken(first), hashAuthToken(first));
});

test("token helpers enforce the configured expiry", () => {
  const now = Date.now();
  assert.equal(
    getTokenExpiry(30 * 60 * 1000, now).getTime(),
    now + 30 * 60 * 1000,
  );
});
