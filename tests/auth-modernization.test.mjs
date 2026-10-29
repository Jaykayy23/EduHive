import assert from "node:assert/strict";
import test from "node:test";
import { hash } from "@node-rs/argon2";
import { authOrigins, verifyPassword } from "../lib/auth/policy.ts";
import { migrateAccounts } from "../scripts/migrate-auth.mjs";

test("password verification accepts existing Argon2 hashes and rejects wrong passwords", async () => {
  const encoded = await hash("existing secret");
  assert.equal(await verifyPassword(encoded, "existing secret"), true);
  assert.equal(await verifyPassword(encoded, "wrong"), false);
  assert.equal(await verifyPassword("invalid encoded value", "secret"), false);
});
test("trusted origins reject arbitrary hosts, paths, credentials and insecure production URLs", () => {
  assert.deepEqual(
    authOrigins("https://study.example", "https://preview.example", true),
    ["https://study.example", "https://preview.example"],
  );
  for (const url of [
    "https://evil.example/path",
    "https://user:pass@study.example",
    "http://study.example",
    "javascript:alert(1)",
  ]) {
    assert.throws(() => authOrigins(url, "", true));
  }
  assert.deepEqual(authOrigins("http://localhost:3000", "", false), [
    "http://localhost:3000",
  ]);
});
test("migration dry-run writes nothing and repeated migration preserves identities and hashes", async () => {
  const users = [
    {
      id: "immutable",
      passwordHash: "$argon2id$existing",
      googleId: "google-sub",
      username: "CaseName",
      emailVerifiedAt: null,
    },
  ];
  const rows = [];
  const db = {
    user: { findMany: async () => users },
    account: {
      findUnique: async ({ where }) =>
        rows.find(
          (r) =>
            r.providerId === where.providerId_accountId.providerId &&
            r.accountId === where.providerId_accountId.accountId,
        ),
      create: async ({ data }) => {
        rows.push(data);
        return data;
      },
    },
  };
  const before = structuredClone(users);
  assert.deepEqual(await migrateAccounts(db), {
    users: 1,
    credential: 1,
    google: 1,
    created: 0,
  });
  assert.equal(rows.length, 0);
  await migrateAccounts(db, { apply: true });
  await migrateAccounts(db, { apply: true });
  assert.equal(rows.length, 2);
  assert.equal(
    rows.find((r) => r.providerId === "credential").password,
    "$argon2id$existing",
  );
  assert.equal(
    rows.find((r) => r.providerId === "google").accountId,
    "google-sub",
  );
  assert.equal(
    rows.every((r) => r.userId === "immutable"),
    true,
  );
  assert.deepEqual(users, before);
});
test("migration refuses to remap an identity owned by a different application user", async () => {
  const db = {
    user: { findMany: async () => [{ id: "target", googleId: "sub" }] },
    account: { findUnique: async () => ({ userId: "other" }) },
  };
  await assert.rejects(
    migrateAccounts(db, { apply: true }),
    /identity conflict/i,
  );
});
