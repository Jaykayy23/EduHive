import { Prisma } from "./generated/prisma";

export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    username: true,
    displayName: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
    attachments: true,
    likes: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    bookmarks: {
      where: {
        userId: loggedInUserId,
      },
      select: {
        userId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export function getCommentDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.CommentInclude;
}

export type CommentData = Prisma.CommentGetPayload<{
  include: ReturnType<typeof getCommentDataInclude>;
}>;

export interface CommentsPage {
  comments: CommentData[];
  previousCursor: string | null;
}

export const notificationsInclude = {
  issuer: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    }
  },
  post: {
    select: {
      content: true
    }
  }

} satisfies Prisma.NotificationInclude

export type NotificationData = Prisma.NotificationGetPayload<{
  include: typeof notificationsInclude
}>

export interface NotificationsPage {
  notifications: NotificationData[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

export interface BookmarkInfo {
  isBookmarkedByUser: boolean;
}

export interface NotificationCountInfo {
  unreadCount: number;
}

// Academic subject categories for filtering
export const ACADEMIC_SUBJECTS = [
  { id: "all", name: "All", emoji: "🎓" },
  { id: "computer-science", name: "Computer Science", emoji: "💻" },
  { id: "mathematics", name: "Mathematics", emoji: "📐" },
  { id: "physics", name: "Physics", emoji: "⚛️" },
  { id: "chemistry", name: "Chemistry", emoji: "🧪" },
  { id: "biology", name: "Human Biology", emoji: "🧬" },
  { id: "biochemistry", name: "BioChem", emoji: "🔬" },
  { id: "food-science", name: "Food Science", emoji: "🍎" },
  { id: "agriculture", name: "Agriculture", emoji: "🌾" },
  { id: "engineering", name: "Engineering", emoji: "⚙️" },
  { id: "medicine", name: "Medicine", emoji: "🏥" },
  { id: "psychology", name: "Psychology", emoji: "🧠" },
] as const

export type SubjectFilter = (typeof ACADEMIC_SUBJECTS)[number]["id"]

