"use server";

import { lucia } from "@/app/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { claimRateLimit, getRequestIp } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1_000;

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);
    const normalizedUsername = username.toLowerCase();
    const ip = await getRequestIp();
    const ipLimit = await claimRateLimit({
      namespace: "login:ip",
      identifier: ip,
      limit: 10,
      windowMs: LOGIN_WINDOW_MS,
    });
    const accountLimit = await claimRateLimit({
      namespace: "login:account",
      identifier: normalizedUsername,
      limit: 30,
      windowMs: LOGIN_WINDOW_MS,
    });
    if (!ipLimit.allowed || !accountLimit.allowed) {
      return {
        error: `Too many login attempts. Try again in ${Math.ceil(
          Math.max(ipLimit.retryAfterSeconds, accountLimit.retryAfterSeconds) / 60,
        )} minute(s).`,
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return { error: "Invalid username or password" };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return { error: "Invalid username or password" };
    }

    if (existingUser.emailVerifiedAt == null) {
      if (existingUser.email) {
        redirect("/verify-email/sent?status=required");
      }
      return { error: "Please verify your email before logging in." };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/home");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}
