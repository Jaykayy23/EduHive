import type { Achievement as PrismaAchievement, UserAchievement as PrismaUserAchievement } from "@prisma/client"

export type Achievement = PrismaAchievement
export type UserAchievement = PrismaUserAchievement & {
  achievement: Achievement
}

export const ACHIEVEMENT_CATEGORIES = {
  POSTING: { name: "Content Creation", emoji: "📝", color: "bg-blue-500" },
  ENGAGEMENT: { name: "Community Engagement", emoji: "💬", color: "bg-green-500" },
  SOCIAL: { name: "Social Connections", emoji: "👥", color: "bg-purple-500" },
  SUBJECT: { name: "Subject Mastery", emoji: "🎓", color: "bg-orange-500" },
  STREAK: { name: "Consistency", emoji: "🔥", color: "bg-red-500" },
  SPECIAL: { name: "Special", emoji: "⭐", color: "bg-yellow-500" },
} as const

export const RARITY_COLORS = {
  COMMON: "text-gray-600 border-gray-300",
  UNCOMMON: "text-green-600 border-green-300",
  RARE: "text-blue-600 border-blue-300",
  EPIC: "text-purple-600 border-purple-300",
  LEGENDARY: "text-yellow-600 border-yellow-300",
} as const

export const RARITY_NAMES = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  EPIC: "Epic",
  LEGENDARY: "Legendary",
} as const
