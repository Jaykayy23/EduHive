-- Additive cutover: never rename users, mutate IDs/hashes or drop legacy tokens/sessions.
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "users" SET "emailVerified" = ("emailVerifiedAt" IS NOT NULL);
CREATE TABLE "auth_sessions" (
 "id" TEXT PRIMARY KEY, "token" TEXT NOT NULL, "userId" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, "ipAddress" TEXT, "userAgent" TEXT,
 CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "auth_sessions_token_key" ON "auth_sessions"("token");
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");
CREATE TABLE "auth_accounts" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL,
 "password" TEXT, "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT,
 "accessTokenExpiresAt" TIMESTAMP(3), "refreshTokenExpiresAt" TIMESTAMP(3), "scope" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "auth_accounts_providerId_accountId_key" ON "auth_accounts"("providerId", "accountId");
CREATE INDEX "auth_accounts_userId_idx" ON "auth_accounts"("userId");
CREATE TABLE "auth_verifications" (
 "id" TEXT PRIMARY KEY, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "auth_verifications_identifier_idx" ON "auth_verifications"("identifier");
