CREATE TABLE "AuthEmailRateLimit" (
    "key" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthEmailRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "AuthEmailRateLimit_updatedAt_idx"
ON "AuthEmailRateLimit"("updatedAt");
