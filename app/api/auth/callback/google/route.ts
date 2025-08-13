
import { google, lucia } from "@/app/auth"
import kyInstance from "@/lib/ky"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { generateIdFromEntropySize } from "lucia"
import { slugify } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const error = req.nextUrl.searchParams.get("error")

  // Handle OAuth errors from Google
  if (error) {
    console.error("OAuth error from Google:", error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=oauth_${error}`,
      },
    })
  }

  const cookieStore = await cookies()
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null
  const storedCodeVerifier = cookieStore.get("google_oauth_code_verifier")?.value ?? null

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=invalid_request",
      },
    })
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier)

    // Clear OAuth cookies
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
        picture?: string
      }>()

    // Simple avatar URL - just use what Google gives us
    const avatarUrl = googleUser.picture || null

    // Check if user exists with Google ID
    const existingUser = await prisma.user.findUnique({
      where: { googleId: googleUser.sub },
    })

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          avatarUrl: avatarUrl,
          displayName: googleUser.name,
        },
      })

      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return new Response(null, {
        status: 302,
        headers: { Location: "/home" },
      })
    }

    // Check if email exists
    const existingEmailUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (existingEmailUser) {
      // Link Google account
      await prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl: avatarUrl,
          displayName: googleUser.name,
        },
      })

      const session = await lucia.createSession(existingEmailUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      return new Response(null, {
        status: 302,
        headers: { Location: "/home" },
      })
    }

    // Create new user
    const userId = generateIdFromEntropySize(10)
    const baseUsername = slugify(googleUser.name)
    let username = baseUsername + "-" + userId.slice(0, 4)

    // Ensure username is unique
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
        displayName: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        avatarUrl: avatarUrl,
      },
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

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=server_error",
      },
    })
  }
}
