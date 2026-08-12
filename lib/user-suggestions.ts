import "server-only";

import prisma from "@/lib/prisma";
import { getUserDataSelect, type UsersPage } from "@/lib/types";

export const HOME_SUGGESTION_LIMIT = 5;
export const DISCOVER_SUGGESTION_PAGE_SIZE = 20;

interface GetUserSuggestionsOptions {
  cursor?: string;
  limit?: number;
}

export async function getUserSuggestions(
  loggedInUserId: string,
  {
    cursor,
    limit = HOME_SUGGESTION_LIMIT,
  }: GetUserSuggestionsOptions = {},
): Promise<UsersPage> {
  const users = await prisma.user.findMany({
    where: {
      id: { not: loggedInUserId },
      followers: {
        none: { followerId: loggedInUserId },
      },
    },
    select: getUserDataSelect(loggedInUserId),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  });

  return {
    users: users.slice(0, limit),
    nextCursor: users.length > limit ? users[limit].id : null,
  };
}
