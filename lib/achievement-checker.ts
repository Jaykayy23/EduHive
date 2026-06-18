import prisma from "@/lib/prisma"

interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category: "POSTING" | "ENGAGEMENT" | "SOCIAL" | "SUBJECT" | "STREAK" | "SPECIAL"
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY"
  points: number
  check: (stats: UserStats) => boolean
}

interface UserStats {
  postCount: number
  commentCount: number
  likeCount: number
  followerCount: number
  followingCount: number
  bookmarkCount: number
}

const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-post",
    name: "First Steps",
    description: "Create your first post",
    icon: "📝",
    category: "POSTING",
    rarity: "COMMON",
    points: 10,
    check: (stats) => stats.postCount >= 1,
  },
  {
    id: "five-posts",
    name: "Getting Started",
    description: "Create 5 posts",
    icon: "✍️",
    category: "POSTING",
    rarity: "UNCOMMON",
    points: 25,
    check: (stats) => stats.postCount >= 5,
  },
  {
    id: "twenty-posts",
    name: "Prolific Writer",
    description: "Create 20 posts",
    icon: "🖊️",
    category: "POSTING",
    rarity: "RARE",
    points: 50,
    check: (stats) => stats.postCount >= 20,
  },
  {
    id: "first-comment",
    name: "Conversation Starter",
    description: "Leave your first comment",
    icon: "💬",
    category: "ENGAGEMENT",
    rarity: "COMMON",
    points: 10,
    check: (stats) => stats.commentCount >= 1,
  },
  {
    id: "ten-comments",
    name: "Active Participant",
    description: "Leave 10 comments",
    icon: "🗣️",
    category: "ENGAGEMENT",
    rarity: "UNCOMMON",
    points: 25,
    check: (stats) => stats.commentCount >= 10,
  },
  {
    id: "first-follower",
    name: "Making Friends",
    description: "Get your first follower",
    icon: "👋",
    category: "SOCIAL",
    rarity: "COMMON",
    points: 10,
    check: (stats) => stats.followerCount >= 1,
  },
  {
    id: "ten-followers",
    name: "Rising Star",
    description: "Gain 10 followers",
    icon: "⭐",
    category: "SOCIAL",
    rarity: "RARE",
    points: 50,
    check: (stats) => stats.followerCount >= 10,
  },
  {
    id: "fifty-followers",
    name: "Campus Celebrity",
    description: "Gain 50 followers",
    icon: "🌟",
    category: "SOCIAL",
    rarity: "EPIC",
    points: 100,
    check: (stats) => stats.followerCount >= 50,
  },
  {
    id: "first-like",
    name: "Appreciated",
    description: "Receive your first like",
    icon: "❤️",
    category: "ENGAGEMENT",
    rarity: "COMMON",
    points: 10,
    check: (stats) => stats.likeCount >= 1,
  },
  {
    id: "bookworm",
    name: "Bookworm",
    description: "Bookmark 5 posts",
    icon: "📚",
    category: "ENGAGEMENT",
    rarity: "UNCOMMON",
    points: 15,
    check: (stats) => stats.bookmarkCount >= 5,
  },
]

async function getUserStats(userId: string): Promise<UserStats> {
  const [postCount, commentCount, likeCount, followerCount, followingCount, bookmarkCount] =
    await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.comment.count({ where: { userId } }),
      prisma.like.count({ where: { post: { userId } } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.bookmark.count({ where: { userId } }),
    ])

  return { postCount, commentCount, likeCount, followerCount, followingCount, bookmarkCount }
}

export async function checkUserAchievements(userId: string) {
  const stats = await getUserStats(userId)

  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })

  const earnedIds = new Set(existingAchievements.map((a) => a.achievementId))
  const newlyUnlocked: string[] = []

  for (const definition of achievementDefinitions) {
    if (earnedIds.has(definition.id)) continue
    if (!definition.check(stats)) continue

    // Ensure the achievement record exists in the DB
    await prisma.achievement.upsert({
      where: { id: definition.id },
      update: {},
      create: {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        icon: definition.icon,
        category: definition.category,
        rarity: definition.rarity,
        points: definition.points,
      },
    })

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: definition.id,
      },
    })

    newlyUnlocked.push(definition.id)
  }

  return newlyUnlocked
}
