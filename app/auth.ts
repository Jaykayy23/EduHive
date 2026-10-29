import prisma from "@/lib/prisma";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { Google } from "arctic";
import { authOrigins } from "@/lib/auth/policy";
import { createSessionService } from "@/lib/auth/session-service.mjs";
import type { AuthResult } from "@/lib/auth/types";

const production = process.env.NODE_ENV === "production";
const baseURL =
  process.env.BETTER_AUTH_URL ||
  (production ? undefined : "http://localhost:3000");
// Build-time module evaluation does not authenticate or need production secrets.
// Missing configuration is rejected at the first real auth operation below.
const origins = baseURL
  ? authOrigins(baseURL, process.env.AUTH_TRUSTED_ORIGINS, production)
  : [];
function makeAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: origins,
    user: {
      fields: { name: "displayName", image: "avatarUrl" },
      additionalFields: {
        username: { type: "string", required: true, input: false },
      },
    },
    session: {
      modelName: "AuthSession",
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    advanced: { useSecureCookies: production },
  });
}

function assertConfigured() {
  if (
    !baseURL ||
    !process.env.BETTER_AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET.length < 32
  ) {
    throw new Error(
      "Configure BETTER_AUTH_URL and a BETTER_AUTH_SECRET of at least 32 characters",
    );
  }
}
let service: ReturnType<typeof createSessionService> | undefined;
function getService() {
  assertConfigured();
  return (service ??= createSessionService(makeAuth(), prisma.user));
}
export const authSessions = {
  createSession: async (userId: string) => getService().createSession(userId),
  createSessionCookie: async (token: string) =>
    getService().createSessionCookie(token),
  createBlankSessionCookie: async () => getService().createBlankSessionCookie(),
  invalidateSession: async (id: string) => getService().invalidateSession(id),
};

export function createGoogleOAuthClient(requestUrl: string) {
  assertConfigured();
  if (!origins.includes(new URL(requestUrl).origin))
    throw new Error("Untrusted OAuth origin");
  const redirectUri = new URL(
    "/api/auth/callback/google",
    requestUrl,
  ).toString();
  return new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri,
  );
}

export const validateRequest = cache(async (): Promise<AuthResult> => {
  const requestHeaders = await headers();
  // Anonymous public/build requests need no database connection or auth secrets.
  if (!requestHeaders.get("cookie")?.includes("better-auth.session_token"))
    return { user: null, session: null };
  assertConfigured();
  const store = await cookies();
  return (await getService().validate(
    requestHeaders,
    async (cookie: {
      name: string;
      value: string;
      attributes: Record<string, unknown>;
    }) => {
      try {
        store.set(cookie.name, cookie.value, cookie.attributes);
      } catch {
        /* Server Components cannot write cookies. */
      }
    },
  )) as AuthResult;
});
