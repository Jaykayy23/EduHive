
import { createGoogleOAuthClient } from "@/app/auth"
import { generateCodeVerifier, generateState } from "arctic"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const google = createGoogleOAuthClient(request.url)

    // Create authorization URL with proper scopes
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ])

    const response = NextResponse.redirect(url, 302)

    // Put the PKCE cookies on the same response that sends the browser to
    // Google, so the callback is guaranteed to receive them.
    response.cookies.set("google_oauth_state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
    })

    response.cookies.set("google_oauth_code_verifier", codeVerifier, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 15, // 15 minutes
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Google OAuth initiation error:", error)
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "oauth_init_error")
    return NextResponse.redirect(loginUrl, 302)
  }
}
