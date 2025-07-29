import { RARITY_COLORS } from "@/lib/achievements"
import type { Achievement } from "@prisma/client"
import { cn } from "@/lib/utils"

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked?: boolean
  size?: "sm" | "md" | "lg"
}

export default function AchievementBadge({ achievement, unlocked = false, size = "md" }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 font-semibold transition-all",
        sizeClasses[size],
        unlocked ? RARITY_COLORS[achievement.rarity] : "text-gray-400 border-gray-200 bg-gray-50",
        unlocked && "shadow-sm hover:shadow-md",
      )}
      title={`${achievement.name} - ${achievement.description}`}
    >
      <span className={cn("text-center", unlocked ? "" : "grayscale")}>{achievement.icon}</span>
    </div>
  )
}
