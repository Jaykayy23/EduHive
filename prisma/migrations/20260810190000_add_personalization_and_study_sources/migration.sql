-- CreateTable
CREATE TABLE "user_preferences" (
    "userId" TEXT NOT NULL,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "studyModes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "academicLevel" TEXT NOT NULL,
    "weeklyStudySessions" INTEGER NOT NULL DEFAULT 3,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("userId")
);

-- AlterTable
ALTER TABLE "chat_sessions"
ADD COLUMN "sourcePostId" TEXT,
ADD COLUMN "studyMode" TEXT;

-- CreateIndex
CREATE INDEX "chat_sessions_sourcePostId_idx" ON "chat_sessions"("sourcePostId");

-- AddForeignKey
ALTER TABLE "user_preferences"
ADD CONSTRAINT "user_preferences_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions"
ADD CONSTRAINT "chat_sessions_sourcePostId_fkey"
FOREIGN KEY ("sourcePostId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
