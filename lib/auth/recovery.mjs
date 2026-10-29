import { randomUUID } from "node:crypto";

// Runs inside the caller transaction: token consumption, password/identity sync
// and revocation either commit together or none of them do.
export async function applyPasswordReset(
  tx,
  tokenRecord,
  passwordHash,
  now = new Date(),
) {
  const consumed = await tx.passwordResetToken.deleteMany({
    where: { id: tokenRecord.id, expiresAt: { gt: now } },
  });
  if (consumed.count !== 1) return false;
  await tx.user.update({
    where: { id: tokenRecord.userId },
    data: { passwordHash, emailVerifiedAt: now, emailVerified: true },
  });
  await tx.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: tokenRecord.userId,
      },
    },
    create: {
      id: randomUUID(),
      userId: tokenRecord.userId,
      providerId: "credential",
      accountId: tokenRecord.userId,
      password: passwordHash,
    },
    update: { password: passwordHash },
  });
  await tx.emailVerificationToken.deleteMany({
    where: { userId: tokenRecord.userId },
  });
  await tx.authSession.deleteMany({ where: { userId: tokenRecord.userId } });
  await tx.session.deleteMany({ where: { userId: tokenRecord.userId } });
  return true;
}
