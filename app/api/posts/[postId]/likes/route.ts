import { validateRequest } from "@/app/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { claimRateLimit } from "@/lib/rate-limit";

async function enforceLikeMutationLimit(userId: string) {
  const rateLimit = await claimRateLimit({
    namespace: "like:mutation",
    identifier: userId,
    limit: 100,
    windowMs: 10 * 60 * 1_000,
  });
  if (rateLimit.allowed) return null;

  return Response.json(
    { error: "Like limit reached. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: {
            userId: loggedInUser.id,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimitResponse = await enforceLikeMutationLimit(loggedInUser.id);
    if (rateLimitResponse) return rateLimitResponse;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const created = await tx.like.createMany({
        data: {
          userId: loggedInUser.id,
          postId,
        },
        skipDuplicates: true,
      });
      if (created.count === 1 && loggedInUser.id !== post.userId) {
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: post.userId,
            postId,
            type: "LIKE",
          },
        });
      }
    });

    

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimitResponse = await enforceLikeMutationLimit(loggedInUser.id);
    if (rateLimitResponse) return rateLimitResponse;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
      },
    });
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }
    await prisma.$transaction([
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        }
      })
    ])
    
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
