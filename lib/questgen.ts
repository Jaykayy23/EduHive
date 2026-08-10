const DEVELOPMENT_QUESTGEN_URL = "http://127.0.0.1:8000";

export function getQuestgenUrl(
  path: string,
  configuredUrl = process.env.QUESTGEN_API_URL?.trim(),
  nodeEnv = process.env.NODE_ENV,
): string {
  const baseUrl = configuredUrl ||
    (nodeEnv === "development" ? DEVELOPMENT_QUESTGEN_URL : undefined);
  if (!baseUrl) {
    throw new Error("QUESTGEN_API_URL is not configured.");
  }

  let url: URL;
  try {
    url = new URL(path, `${baseUrl.replace(/\/$/, "")}/`);
  } catch {
    throw new Error("QUESTGEN_API_URL must use HTTP or HTTPS.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("QUESTGEN_API_URL must use HTTP or HTTPS.");
  }

  return url.toString();
}
