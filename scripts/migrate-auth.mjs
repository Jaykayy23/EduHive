import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

// The dry-run is the default; only aggregate counts leave this module.
export async function migrateAccounts(db, { apply = false } = {}) {
  const users = await db.user.findMany({
    select: { id: true, passwordHash: true, googleId: true },
  });
  const counts = { users: users.length, credential: 0, google: 0, created: 0 };
  for (const user of users) {
    const identities = [];
    if (user.passwordHash)
      identities.push({
        providerId: "credential",
        accountId: user.id,
        password: user.passwordHash,
      });
    if (user.googleId)
      identities.push({ providerId: "google", accountId: user.googleId });
    for (const identity of identities) {
      counts[identity.providerId]++;
      const existing = await db.account.findUnique({
        where: {
          providerId_accountId: {
            providerId: identity.providerId,
            accountId: identity.accountId,
          },
        },
      });
      if (existing && existing.userId !== user.id)
        throw new Error("Authentication identity conflict; migration stopped");
      if (!existing && apply) {
        await db.account.create({
          data: { id: randomUUID(), userId: user.id, ...identity },
        });
        counts.created++;
      }
    }
  }
  return counts;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const args = process.argv.slice(2);
  if (!args.includes("--dry-run") && !args.includes("--apply"))
    throw new Error("Choose --dry-run or --apply");
  if (args.includes("--dry-run") && args.includes("--apply"))
    throw new Error("Choose exactly one mode");
  // Never silently inherit a configured production DATABASE_URL.
  const url = process.env.AUTH_MIGRATION_DATABASE_URL;
  if (!url)
    throw new Error(
      "Set explicit AUTH_MIGRATION_DATABASE_URL; DATABASE_URL is deliberately ignored",
    );
  const { PrismaClient } = await import("../lib/generated/prisma/index.js");
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    const result = await db.$transaction(
      (tx) => migrateAccounts(tx, { apply: args.includes("--apply") }),
      { timeout: 120000 },
    );
    console.log(JSON.stringify(result));
  } finally {
    await db.$disconnect();
  }
}
