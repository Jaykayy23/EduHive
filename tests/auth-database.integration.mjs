import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { hash, verify } from "@node-rs/argon2";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { migrateAccounts } from "../scripts/migrate-auth.mjs";
import { applyPasswordReset } from "../lib/auth/recovery.mjs";
import { createSessionService } from "../lib/auth/session-service.mjs";

// Explicitly opt in. Never use DATABASE_URL or reset/drop an existing schema.
const raw = process.env.AUTH_TEST_DATABASE_URL;
if (!raw)
  throw new Error(
    "Set AUTH_TEST_DATABASE_URL to an empty disposable loopback eduhive_auth_test database",
  );
const url = new URL(raw);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
  !url.pathname.startsWith("/eduhive_auth_test")
)
  throw new Error(
    "Unsafe test database: require loopback and eduhive_auth_test prefix",
  );
const db = new PrismaClient({ datasources: { db: { url: raw } } });
const psql = process.env.PG_BIN
  ? path.join(
      process.env.PG_BIN,
      process.platform === "win32" ? "psql.exe" : "psql",
    )
  : "psql";
function apply(file) {
  execFileSync(psql, ["-v", "ON_ERROR_STOP=1", "-f", file], {
    env: {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: url.pathname.slice(1),
    },
    stdio: "pipe",
  });
}

test("additive migration preserves legacy users, relationships, hashes and bounded tokens; Better Auth enforces session lifecycle", async () => {
  try {
    const [{ count }] = await db.$queryRawUnsafe(
      "SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'",
    );
    assert.equal(
      count,
      0,
      "Integration requires an empty disposable database; refusing to alter existing data",
    );
    const migrations = readdirSync("prisma/migrations")
      .filter((x) => x !== "migration_lock.toml")
      .sort();
    for (const migration of migrations.slice(0, -1))
      apply(`prisma/migrations/${migration}/migration.sql`);
    const password = await hash("legacy correct password");
    // Raw SQL intentionally creates a row in the old schema before new columns exist.
    await db.$executeRawUnsafe(
      'INSERT INTO users (id,username,"displayName",email,"passwordHash","googleId","emailVerifiedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW())',
      "legacy-id",
      "CaseName",
      "Legacy Fixture",
      "legacy@example.test",
      password,
      "provider-sub",
    );
    await db.$executeRawUnsafe(
      'INSERT INTO posts(id,content,"userId") VALUES ($1,$2,$3)',
      "fixture-post",
      "Sample fixture only",
      "legacy-id",
    );
    await db.$executeRawUnsafe(
      'INSERT INTO "PasswordResetToken"(id,"userId","tokenHash","expiresAt") VALUES ($1,$2,$3,$4)',
      "reset-fixture",
      "legacy-id",
      "fixture-token-hash",
      new Date(Date.now() + 600000),
    );
    apply(`prisma/migrations/${migrations.at(-1)}/migration.sql`);
    const before = await db.user.findUniqueOrThrow({
      where: { id: "legacy-id" },
      include: { posts: true, passwordResetToken: true },
    });
    assert.equal(before.emailVerified, true);
    const dry = await migrateAccounts(db);
    assert.equal(dry.created, 0);
    assert.equal(await db.account.count(), 0);
    await db.$transaction((tx) => migrateAccounts(tx, { apply: true }));
    const twice = await db.$transaction((tx) =>
      migrateAccounts(tx, { apply: true }),
    );
    assert.equal(twice.created, 0);
    assert.equal(await db.account.count(), 2);
    const after = await db.user.findUniqueOrThrow({
      where: { id: "legacy-id" },
      include: { posts: true, passwordResetToken: true },
    });
    assert.deepEqual(after, before);
    const credential = await db.account.findUniqueOrThrow({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: "legacy-id",
        },
      },
    });
    assert.equal(credential.password, password);
    assert.equal(
      await verify(credential.password, "legacy correct password"),
      true,
    );
    const google = await db.account.findUniqueOrThrow({
      where: {
        providerId_accountId: {
          providerId: "google",
          accountId: "provider-sub",
        },
      },
    });
    assert.equal(google.userId, "legacy-id");
    const auth = betterAuth({
      database: prismaAdapter(db, { provider: "postgresql" }),
      baseURL: "http://localhost:3000",
      secret: "disposable-fixture-secret-over-thirty-two-characters",
      user: {
        fields: { name: "displayName", image: "avatarUrl" },
        additionalFields: {
          username: { type: "string", required: true, input: false },
        },
      },
      session: {
        modelName: "AuthSession",
        expiresIn: 2592000,
        updateAge: 86400,
        cookieCache: { enabled: false },
      },
    });
    const service = createSessionService(auth, db.user);
    async function session() {
      const s = await service.createSession("legacy-id");
      const c = await service.createSessionCookie(s.token);
      return {
        s,
        headers: new Headers({
          cookie: `${c.name}=${encodeURIComponent(c.value)}`,
        }),
      };
    }
    const f = await session();
    assert.equal((await service.validate(f.headers)).user.id, "legacy-id");
    await db.authSession.update({
      where: { id: f.s.id },
      data: {
        expiresAt: new Date(Date.now() + 3600000),
        updatedAt: new Date(Date.now() - 172800000),
      },
    });
    const cookies = [];
    await service.validate(f.headers, (c) => cookies.push(c));
    assert.ok(cookies[0].attributes.expires.getTime() > Date.now() + 86400000);
    await service.invalidateSession(f.s.id);
    assert.equal((await service.validate(f.headers)).user, null);
    const expired = await session();
    await db.authSession.update({
      where: { id: expired.s.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    assert.equal((await service.validate(expired.headers)).user, null);
    const reset = await session();
    const newHash = await hash("new password");
    const resetToken = await db.passwordResetToken.findUniqueOrThrow({
      where: { id: "reset-fixture" },
    });
    assert.equal(
      await db.$transaction((tx) =>
        applyPasswordReset(tx, resetToken, newHash),
      ),
      true,
    );
    assert.equal(
      await db.$transaction((tx) =>
        applyPasswordReset(tx, resetToken, password),
      ),
      false,
    );
    assert.equal(
      (await db.user.findUniqueOrThrow({ where: { id: "legacy-id" } }))
        .passwordHash,
      newHash,
    );
    assert.equal(
      (
        await db.account.findUniqueOrThrow({
          where: {
            providerId_accountId: {
              providerId: "credential",
              accountId: "legacy-id",
            },
          },
        })
      ).password,
      newHash,
    );
    assert.equal((await service.validate(reset.headers)).user, null);
    const unverified = await session();
    await db.user.update({
      where: { id: "legacy-id" },
      data: { emailVerifiedAt: null, emailVerified: false },
    });
    assert.equal((await service.validate(unverified.headers)).user, null);
    await assert.rejects(
      service.createSession("legacy-id"),
      /verification required/,
    );
  } finally {
    await db.$disconnect();
  }
});
