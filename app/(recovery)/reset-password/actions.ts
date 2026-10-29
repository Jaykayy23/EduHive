"use server";

import { applyPasswordReset } from "@/lib/auth/recovery.mjs";
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

    const resetApplied = await prisma.$transaction((tx) =>
      applyPasswordReset(tx, tokenRecord, passwordHash, now),
    );

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
