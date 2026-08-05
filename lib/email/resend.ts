import { Resend } from "resend"

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return new Resend(apiKey)
}

export function getEmailFrom() {
  const emailFrom = process.env.EMAIL_FROM?.trim()
  if (!emailFrom) {
    throw new Error("EMAIL_FROM is not configured")
  }

  return emailFrom
}

export function getAppUrl() {
  const configuredUrl =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_BASE_URL?.trim()

  if (!configuredUrl && process.env.NODE_ENV === "production") {
    throw new Error("APP_URL is not configured")
  }

  const appUrl = configuredUrl || "http://localhost:3000"

  return appUrl.replace(/\/+$/, "")
}
