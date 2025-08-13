
import { PrismaAdapter } from "@lucia-auth/adapter-prisma"
import prisma from "@/lib/prisma"
import { Lucia, type Session, type User } from "lucia"
import { cache } from "react"
import { cookies } from "next/headers"
import { Google } from "arctic"

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    }
  },
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseUserAttributes {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  googleId: string | null
}

// Ensure the redirect URI exactly matches what's in Google Console
const redirectUri =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`
    : "http://localhost:3000/api/auth/callback/google"

console.log("Google OAuth redirect URI:", redirectUri)

export const google = new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, redirectUri)

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    // Retrieve cookies store once
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null

    if (!sessionId) {
      return { user: null, session: null }
    }

    const result = await lucia.validateSession(sessionId)
    try {
      // Only attempt to set cookie if the cookies object is writable (has set method)
      const hasSet = (
        obj: unknown,
      ): obj is { set: (name: string, value: string, attributes: Record<string, unknown>) => void } =>
        typeof obj === "object" &&
        obj !== null &&
        "set" in obj &&
        typeof (obj as { set?: unknown }).set === "function"

      if (result.session && result.session.fresh && hasSet(cookieStore)) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!result.session && hasSet(cookieStore)) {
        const sessionCookie = lucia.createBlankSessionCookie()
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
    } catch {}
    return result
  },
)
