"use server";

import { validateRequest } from "@/app/auth";
import { getCommentDataInclude } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { claimRateLimit } from "@/lib/rate-limit";

export async function submitComment({
  postId,
  content,
}: {
  postId: string;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const parsed = createCommentSchema.parse({ postId, content });
  const rateLimit = await claimRateLimit({
    namespace: "comment:create",
    identifier: user.id,
    limit: 30,
    windowMs: 10 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    throw new Error("Comment limit reached. Please wait before commenting again.");
  }

  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: parsed.postId },
      select: { userId: true },
    });
    if (!post) throw new Error("Post not found");

    const newComment = await tx.comment.create({
      data: {
        content: parsed.content,
        postId: parsed.postId,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    });

    if (post.userId !== user.id) {
      await tx.notification.create({
        data: {
          issuerId: user.id,
          recipientId: post.userId,
          postId: parsed.postId,
          type: "COMMENT",
        },
      });
    }

    return newComment;
  });
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== user.id) throw new Error("Unauthorized");
  const deletedComment= await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id)
  });

  return deletedComment;
}
