ALTER TABLE "post_media"
ADD COLUMN "ownerId" TEXT;

-- Existing attached media can be attributed safely to the owning post. Old,
-- unattached uploads stay nullable and cannot be claimed by new posts.
UPDATE "post_media" AS media
SET "ownerId" = posts."userId"
FROM "posts" AS posts
WHERE media."postId" = posts."id";

CREATE INDEX "post_media_ownerId_postId_idx"
ON "post_media"("ownerId", "postId");

ALTER TABLE "post_media"
ADD CONSTRAINT "post_media_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
