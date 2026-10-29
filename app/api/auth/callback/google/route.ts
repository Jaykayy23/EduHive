import { createGoogleOAuthClient, authSessions } from "@/app/auth";
import { normalizeEmail } from "@/lib/auth/tokens";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import { provisionStreamUser } from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

async function provisionStreamUserSafely(user: {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}) {
  try {
    await provisionStreamUser(user);
  } catch (error) {
    // Google has already verified the identity. Keep sign-in available if
    // Stream is temporarily unavailable; later profile operations can retry.
    console.error("Stream provisioning after Google sign-in failed:", error);
  }
}

function clearGoogleOAuthCookies(response: NextResponse) {
  response.cookies.delete("google_oauth_state");
  response.cookies.delete("google_oauth_code_verifier");
}

function redirectToLogin(request: NextRequest, error: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", error);
  const response = NextResponse.redirect(loginUrl, 302);
  clearGoogleOAuthCookies(response);
  return response;
}

async function createSessionResponse(request: NextRequest, userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.googleId) throw new Error("Missing Google identity");
  const identity = await prisma.account.findUnique({
    where: {
      providerId_accountId: { providerId: "google", accountId: user.googleId },
    },
  });
  if (identity && identity.userId !== userId)
    throw new Error("Google identity conflict");
  await prisma.account.upsert({
    where: {
      providerId_accountId: { providerId: "google", accountId: user.googleId },
    },
    create: {
      id: randomUUID(),
      userId,
      providerId: "google",
      accountId: user.googleId,
    },
    update: {},
  });
  const session = await authSessions.createSession(userId);
  const sessionCookie = await authSessions.createSessionCookie(session.token);
  const response = NextResponse.redirect(new URL("/home", request.url), 302);

  // Attach the session to the redirect itself. This prevents /home from
  // arriving before the browser has received the authenticated cookie.
  response.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  clearGoogleOAuthCookies(response);
  return response;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    console.error("OAuth error from Google:", oauthError);
    return redirectToLogin(req, `oauth_${oauthError}`);
  }

  const storedState = req.cookies.get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    req.cookies.get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return redirectToLogin(req, "invalid_request");
  }

  try {
    const google = createGoogleOAuthClient(req.url);
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    const googleUser = await kyInstance
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      .json<{
        sub: string;
        name: string;
        email: string;
        email_verified: boolean;
        picture?: string;
      }>();

    // Never create a trusted session or link a password account unless the
    // provider explicitly confirms ownership of the email address.
    if (googleUser.email_verified !== true || !googleUser.email) {
      return redirectToLogin(req, "unverified_google_email");
    }

    const email = normalizeEmail(googleUser.email);
    const displayName = googleUser.name || email.split("@")[0];
    const avatarUrl = googleUser.picture || null;
    const now = new Date();

    const existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          avatarUrl,
          displayName,
          emailVerifiedAt: existingUser.emailVerifiedAt ?? now,
          emailVerified: true,
        },
      });
      await provisionStreamUserSafely({
        id: existingUser.id,
        username: existingUser.username,
        displayName,
        avatarUrl,
      });

      return createSessionResponse(req, existingUser.id);
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmailUser) {
      if (
        existingEmailUser.googleId &&
        existingEmailUser.googleId !== googleUser.sub
      )
        return redirectToLogin(req, "identity_conflict");
      await prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl,
          displayName,
          emailVerifiedAt: now,
          emailVerified: true,
        },
      });
      await provisionStreamUserSafely({
        id: existingEmailUser.id,
        username: existingEmailUser.username,
        displayName,
        avatarUrl,
      });

      return createSessionResponse(req, existingEmailUser.id);
    }

    const userId = randomUUID();
    const baseUsername = slugify(displayName) || "user";
    let username = `${baseUsername}-${userId.slice(0, 4)}`;

    let usernameExists = await prisma.user.findUnique({ where: { username } });
    let counter = 1;
    while (usernameExists) {
      username = `${baseUsername}-${userId.slice(0, 4)}-${counter}`;
      usernameExists = await prisma.user.findUnique({ where: { username } });
      counter++;
    }

    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName,
        email,
        googleId: googleUser.sub,
        avatarUrl,
        emailVerifiedAt: now,
        emailVerified: true,
      },
    });

    await provisionStreamUserSafely({
      id: userId,
      username,
      displayName,
      avatarUrl,
    });

    return createSessionResponse(req, userId);
  } catch (error) {
    // Log the useful error message without serializing ky's Request object,
    // which contains the bearer token in its Authorization header.
    console.error(
      "Google OAuth callback error:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return redirectToLogin(req, "server_error");
  }
}
