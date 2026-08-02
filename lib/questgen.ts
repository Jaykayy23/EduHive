export function getQuestgenUrl(
  path: string,
  configuredUrl = process.env.NEXT_PUBLIC_QUESTGEN_API_URL?.trim(),
  nodeEnv = process.env.NODE_ENV,
): string {
  const baseUrl = configuredUrl || (nodeEnv === "development" ? "http://localhost:8000" : "")

  if (!baseUrl) {
    throw new Error("BrainForge is not configured. Set NEXT_PUBLIC_QUESTGEN_API_URL.")
  }

  let url: URL
  try {
    url = new URL(path, `${baseUrl.replace(/\/$/, "")}/`)
  } catch {
    throw new Error("NEXT_PUBLIC_QUESTGEN_API_URL must use HTTP or HTTPS.")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_QUESTGEN_API_URL must use HTTP or HTTPS.")
  }

  return url.toString()
}
