import { google, lucia } from "@/app/auth"
import { normalizeEmail } from "@/lib/auth/tokens"
import kyInstance from "@/lib/ky"
import prisma from "@/lib/prisma"
import { provisionStreamUser } from "@/lib/stream"
import { slugify } from "@/lib/utils"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { generateIdFromEntropySize } from "lucia"

async function provisionStreamUserSafely(user: {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}) {
  try {
    await provisionStreamUser(user)
  } catch (error) {
    // Google has already verified the identity. Keep sign-in available if
    // Stream is temporarily unavailable; later profile operations can retry.
    console.error("Stream provisioning after Google sign-in failed:", error)
  }
}

function redirectToLogin(error: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/login?error=${encodeURIComponent(error)}`,
    },
  })
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const oauthError = req.nextUrl.searchParams.get("error")

  if (oauthError) {
    console.error("OAuth error from Google:", oauthError)
    return redirectToLogin(`oauth_${oauthError}`)
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null
  const storedCodeVerifier = cookieStore.get("google_oauth_code_verifier")?.value ?? null

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return redirectToLogin("invalid_request")
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier)

    cookieStore.delete("google_oauth_state")
    cookieStore.delete("google_oauth_code_verifier")

    const googleUser = await kyInstance
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<{
        sub: string
        name: string
        email: string
        email_verified: boolean
        picture?: string
      }>()

    // Never create a trusted session or link a password account unless the
    // provider explicitly confirms ownership of the email address.
    if (googleUser.email_verified !== true || !googleUser.email) {
      return redirectToLogin("unverified_google_email")
    }

    const email = normalizeEmail(googleUser.email)
    const displayName = googleUser.name || email.split("@")[0]
    const avatarUrl = googleUser.picture || null
    const now = new Date()

    const existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
    })

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          avatarUrl,
          displayName,
          emailVerifiedAt: existingUser.emailVerifiedAt ?? now,
        },
      })
      await provisionStreamUserSafely({
        id: existingUser.id,
        username: existingUser.username,
        displayName,
        avatarUrl,
      })

      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return new Response(null, {
        status: 302,
        headers: { Location: "/home" },
      })
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    })

    if (existingEmailUser) {
      await prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl,
          displayName,
          emailVerifiedAt: now,
        },
      })
      await provisionStreamUserSafely({
        id: existingEmailUser.id,
        username: existingEmailUser.username,
        displayName,
        avatarUrl,
      })

      const session = await lucia.createSession(existingEmailUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return new Response(null, {
        status: 302,
        headers: { Location: "/home" },
      })
    }

    const userId = generateIdFromEntropySize(10)
    const baseUsername = slugify(displayName) || "user"
    let username = `${baseUsername}-${userId.slice(0, 4)}`

    let usernameExists = await prisma.user.findUnique({ where: { username } })
    let counter = 1
    while (usernameExists) {
      username = `${baseUsername}-${userId.slice(0, 4)}-${counter}`
      usernameExists = await prisma.user.findUnique({ where: { username } })
      counter++
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
      },
    })

    await provisionStreamUserSafely({
      id: userId,
      username,
      displayName,
      avatarUrl,
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return new Response(null, {
      status: 302,
      headers: { Location: "/home" },
    })
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    cookieStore.delete("google_oauth_state")
    cookieStore.delete("google_oauth_code_verifier")
    return redirectToLogin("server_error")
  }
}
