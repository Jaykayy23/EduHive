"use server";

import { lucia } from "@/app/auth";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
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
import { provisionStreamUser } from "@/lib/stream";
import { emailSchema } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";

export async function resendVerificationEmail(
  email: string,
): Promise<{ error: string | null }> {
  const startedAt = Date.now();
  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { error: "Enter a valid email address." };
  }

  try {
    if (!(await allowAuthEmailRequest("verification"))) {
      return { error: null };
    }

    const normalizedEmail = normalizeEmail(parsedEmail.data);
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
        emailVerifiedAt: true,
        passwordHash: true,
      },
    });

    // Do not disclose whether an address belongs to an account. This also
    // avoids issuing tokens for Google-only accounts.
    if (!user || !user.email || user.emailVerifiedAt || !user.passwordHash) {
      return { error: null };
    }

    if (!(await allowAuthEmailForAccount("verification", user.id))) {
      return { error: null };
    }

    const token = generateAuthToken();
    const tokenHash = hashAuthToken(token);
    const expiresAt = getTokenExpiry(EMAIL_VERIFICATION_TOKEN_TTL_MS);

    await prisma.emailVerificationToken.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    after(async () => {
      try {
        await sendVerificationEmail({
          email: user.email!,
          username: user.username,
          token,
          tokenHash,
        });
      } catch (error) {
        console.error("Verification email delivery failed:", error);
      }
    });
  } catch (error) {
    console.error("Verification email request failed:", error);
  } finally {
    await waitForUniformAuthEmailResponse(startedAt);
  }

  return { error: null };
}

export async function verifyEmail(
  token: string,
): Promise<{ error: string | null }> {
  try {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return { error: "This verification link is invalid or has expired." };
    }

    const tokenHash = hashAuthToken(token);
    const now = new Date();
    const verifiedUser = await prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.emailVerificationToken.findUnique({
        where: { tokenHash },
      });

      if (!tokenRecord || tokenRecord.expiresAt <= now) {
        return null;
      }

      // Consume the token atomically so a one-time link cannot create two
      // sessions when it is submitted concurrently.
      const consumed = await tx.emailVerificationToken.deleteMany({
        where: {
          id: tokenRecord.id,
          expiresAt: { gt: now },
        },
      });

      if (consumed.count !== 1) {
        return null;
      }

      return tx.user.update({
        where: { id: tokenRecord.userId },
        data: { emailVerifiedAt: now },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      });
    });

    if (!verifiedUser) {
      return { error: "This verification link is invalid or has expired." };
    }

    try {
      await provisionStreamUser(verifiedUser);
    } catch (error) {
      // Verification is durable. A transient Stream outage should not force
      // the user to find another one-time link; future profile flows can
      // retry provisioning.
      console.error(
        "Stream provisioning after email verification failed:",
        error,
      );
    }

    const session = await lucia.createSession(verifiedUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    redirect("/home");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
