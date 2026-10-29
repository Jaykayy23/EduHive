import assert from "node:assert/strict";
import test from "node:test";
import { betterAuth } from "better-auth/minimal";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createSessionService } from "../lib/auth/session-service.mjs";

async function fixture() {
  const row = {
    id: "original-id",
    name: "Existing",
    email: "fixture@example.test",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    username: "CaseName",
    displayName: "Existing",
    avatarUrl: null,
    googleId: null,
    emailVerifiedAt: new Date(),
    passwordHash: "never-serialize",
  };
  const data = { user: [row], session: [], account: [], verification: [] };
  const auth = betterAuth({
    database: memoryAdapter(data),
    baseURL: "http://localhost:3000",
    secret: "fixture-secret-that-is-longer-than-thirty-two-characters",
    session: {
      expiresIn: 2592000,
      updateAge: 86400,
      cookieCache: { enabled: false },
    },
  });
  const service = createSessionService(auth, { findUnique: async () => row });
  const session = await service.createSession(row.id);
  const cookie = await service.createSessionCookie(session.token);
  const headers = new Headers({
    cookie: `${cookie.name}=${encodeURIComponent(cookie.value)}`,
  });
  return { row, data, service, session, headers, auth };
}

test("signed sessions retain application identity and never return password hashes or tokens", async () => {
  const { service, headers } = await fixture();
  const result = await service.validate(headers);
  assert.equal(result.user.id, "original-id");
  assert.equal(result.user.username, "CaseName");
  assert.equal("passwordHash" in result.user, false);
  assert.equal("token" in result.session, false);
});
test("expired, revoked and tampered sessions reject access", async () => {
  const f = await fixture();
  assert.deepEqual(
    await f.service.validate(
      new Headers({ cookie: "better-auth.session_token=tampered" }),
    ),
    { user: null, session: null },
  );
  f.data.session[0].expiresAt = new Date(Date.now() - 1000);
  assert.deepEqual(await f.service.validate(f.headers), {
    user: null,
    session: null,
  });
  const g = await fixture();
  await g.service.invalidateSession(g.session.id);
  assert.deepEqual(await g.service.validate(g.headers), {
    user: null,
    session: null,
  });
});
test("unverified accounts cannot create sessions and lose an existing session", async () => {
  const f = await fixture();
  f.row.emailVerifiedAt = null;
  await assert.rejects(
    f.service.createSession(f.row.id),
    /verification required/,
  );
  assert.deepEqual(await f.service.validate(f.headers), {
    user: null,
    session: null,
  });
  assert.equal(f.data.session.length, 0);
});
test("active sessions renew after the configured update age", async () => {
  const f = await fixture();
  const oldExpiry = new Date(Date.now() + 1000 * 60 * 60);
  f.data.session[0].expiresAt = oldExpiry;
  f.data.session[0].updatedAt = new Date(Date.now() - 2 * 86400000);
  const result = await f.service.validate(f.headers);
  assert.ok(result.session.expiresAt.getTime() > oldExpiry.getTime());
});
