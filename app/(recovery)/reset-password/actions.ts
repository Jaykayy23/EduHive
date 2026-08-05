"use server";

import { hashAuthToken } from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";
import { passwordSchema } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ error: string | null }> {
  try {
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success || !/^[a-f0-9]{64}$/i.test(token)) {
      return { error: "This reset link is invalid or has expired." };
    }

    const tokenHash = hashAuthToken(token);
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.expiresAt <= new Date()) {
      return { error: "This reset link is invalid or has expired." };
    }

    const passwordHash = await hash(parsedPassword.data, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const now = new Date();

    const resetApplied = await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.deleteMany({
        where: {
          id: tokenRecord.id,
          expiresAt: { gt: now },
        },
      });

      if (consumed.count !== 1) {
        return false;
      }

      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash,
          emailVerifiedAt: now,
        },
      });
      await tx.emailVerificationToken.deleteMany({
        where: { userId: tokenRecord.userId },
      });
      await tx.session.deleteMany({
        where: { userId: tokenRecord.userId },
      });

      return true;
    });

    if (!resetApplied) {
      return { error: "This reset link is invalid or has expired." };
    }

    redirect("/login?reset=success");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
