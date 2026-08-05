"use server";

import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";
import {
  PASSWORD_RESET_TOKEN_TTL_MS,
  generateAuthToken,
  getTokenExpiry,
  hashAuthToken,
  normalizeEmail,
} from "@/lib/auth/tokens";
import {
  allowAuthEmailForAccount,
  allowAuthEmailRequest,
  waitForUniformAuthEmailResponse,
} from "@/lib/auth/email-rate-limit";
import prisma from "@/lib/prisma";
import { emailSchema } from "@/lib/validation";
import { after } from "next/server";

export async function requestPasswordReset(email: string) {
  const startedAt = Date.now();
  // This action deliberately returns the same result for invalid, unknown,
  // Google-only, and eligible addresses.
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { success: true };
  }

  const normalizedEmail = normalizeEmail(parsedEmail.data);

  try {
    if (!(await allowAuthEmailRequest("password-reset"))) {
      return { success: true };
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !user.email || !user.passwordHash) {
      return { success: true };
    }

    if (!(await allowAuthEmailForAccount("password-reset", user.id))) {
      return { success: true };
    }

    const token = generateAuthToken();
    const tokenHash = hashAuthToken(token);

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt: getTokenExpiry(PASSWORD_RESET_TOKEN_TTL_MS),
        createdAt: new Date(),
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt: getTokenExpiry(PASSWORD_RESET_TOKEN_TTL_MS),
      },
    });

    after(async () => {
      try {
        await sendPasswordResetEmail({
          email: user.email!,
          username: user.username,
          token,
          tokenHash,
        });
      } catch (error) {
        console.error("Password reset email delivery failed:", error);
      }
    });
  } catch (error) {
    // Keep the response generic even when the provider is unavailable.
    console.error("Password reset request failed:", error);
  } finally {
    await waitForUniformAuthEmailResponse(startedAt);
  }

  return { success: true };
}
