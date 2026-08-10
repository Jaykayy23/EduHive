import { validateRequest } from "@/app/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/lib/types";
import { claimRateLimit } from "@/lib/rate-limit";

async function enforceFollowMutationLimit(userId: string) {
  const rateLimit = await claimRateLimit({
    namespace: "follow:mutation",
    identifier: userId,
    limit: 60,
    windowMs: 10 * 60 * 1_000,
  });
  if (rateLimit.allowed) return null;

  return Response.json(
    { error: "Follow limit reached. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (userId === loggedInUser.id) {
      return Response.json({ error: "You cannot follow yourself" }, { status: 400 });
    }
    const rateLimitResponse = await enforceFollowMutationLimit(loggedInUser.id);
    if (rateLimitResponse) return rateLimitResponse;

    await prisma.$transaction(async (tx) => {
      const created = await tx.follow.createMany({
        data: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        skipDuplicates: true,
      });
      if (created.count === 1) {
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: userId,
            type: "FOLLOW",
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
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimitResponse = await enforceFollowMutationLimit(loggedInUser.id);
    if (rateLimitResponse) return rateLimitResponse;

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
