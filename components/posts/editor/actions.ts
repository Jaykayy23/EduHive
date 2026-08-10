"use server";

import { validateRequest } from "@/app/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";
import { claimRateLimit } from "@/lib/rate-limit";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);
  const rateLimit = await claimRateLimit({
    namespace: "post:create",
    identifier: user.id,
    limit: 20,
    windowMs: 60 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    throw new Error("Post limit reached. Please wait before posting again.");
  }

  return prisma.$transaction(async (tx) => {
    const newPost = await tx.post.create({
      data: {
        content,
        userId: user.id,
      },
    });

    if (mediaIds.length > 0) {
      const attached = await tx.media.updateMany({
        where: {
          id: { in: mediaIds },
          ownerId: user.id,
          postId: null,
        },
        data: { postId: newPost.id },
      });
      if (attached.count !== mediaIds.length) {
        throw new Error("One or more attachments are invalid or already in use.");
      }
    }

    return tx.post.findUniqueOrThrow({
      where: { id: newPost.id },
      include: getPostDataInclude(user.id),
    });
  });
}
