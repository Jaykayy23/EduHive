"use server";

import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  generateAuthToken,
  getTokenExpiry,
  hashAuthToken,
  normalizeEmail,
} from "@/lib/auth/tokens";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string | null }> {
  try {
    const parsed = signUpSchema.parse(credentials);
    const username = parsed.username.trim();
    const email = normalizeEmail(parsed.email);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return { error: "Username already exists" };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return { error: "Email already taken" };
    }

    const passwordHash = await hash(parsed.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const userId = generateIdFromEntropySize(10);
    const token = generateAuthToken();
    const tokenHash = hashAuthToken(token);
    const expiresAt = getTokenExpiry(EMAIL_VERIFICATION_TOKEN_TTL_MS);

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: userId,
            username,
            displayName: username,
            email,
            passwordHash,
            emailVerifiedAt: null,
          },
        });

        await tx.emailVerificationToken.create({
          data: {
            userId,
            tokenHash,
            expiresAt,
          },
        });
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        return { error: "Username or email already exists" };
      }
      throw error;
    }

    try {
      await sendVerificationEmail({
        email,
        username,
        token,
        tokenHash,
      });
    } catch (error) {
      console.error("Verification email delivery failed:", error);
      redirect("/verify-email/sent?delivery=failed");
    }

    redirect("/verify-email/sent");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
