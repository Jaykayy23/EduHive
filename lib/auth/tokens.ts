import { createHash, randomBytes } from "node:crypto";

export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function generateAuthToken() {
  return randomBytes(32).toString("hex");
}

export function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiry(ttlMs: number, now = Date.now()) {
  return new Date(now + ttlMs);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
