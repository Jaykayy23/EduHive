import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { MAX_STUDY_SOURCE_LENGTH, type StudyPostContext } from "@/lib/study";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      user: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const response: StudyPostContext = {
    id: post.id,
    content: post.content.slice(0, MAX_STUDY_SOURCE_LENGTH),
    author: post.user,
  };

  return NextResponse.json(response);
}
