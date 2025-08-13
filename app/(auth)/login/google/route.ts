
import { google } from "@/app/auth"
import { generateCodeVerifier, generateState } from "arctic"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    // Create authorization URL with proper scopes
        const url = await google.createAuthorizationURL(state, codeVerifier, [
          "openid",
          "profile",
          "email",
        ])

    const cookieStore = await cookies()

    // Set cookies with longer expiration and proper settings
    cookieStore.set("google_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
    })

    cookieStore.set("google_oauth_code_verifier", codeVerifier, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
    })

    console.log("OAuth initiation - State:", state)
    console.log("OAuth initiation - Redirect URL:", url.toString())

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
      },
    })
  } catch (error) {
    console.error("Google OAuth initiation error:", error)
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login?error=oauth_init_error",
      },
    })
  }
}
