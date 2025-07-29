import prisma from "./prisma"
import type { Achievement } from "@prisma/client"

export class AchievementChecker {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async checkAllAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    try {
      // Check each category of achievements
      const postingAchievements = await this.checkPostingAchievements()
      const engagementAchievements = await this.checkEngagementAchievements()
      const socialAchievements = await this.checkSocialAchievements()
      const subjectAchievements = await this.checkSubjectAchievements()

      newAchievements.push(
        ...postingAchievements,
        ...engagementAchievements,
        ...socialAchievements,
        ...subjectAchievements,
      )
    } catch (error) {
      console.error("Error checking achievements:", error)
    }

    return newAchievements
  }

  private async checkPostingAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    try {
      const postCount = await prisma.post.count({
        where: { userId: this.userId },
      })

      const achievementsToCheck = [
        { id: "first_post", threshold: 1 },
        { id: "prolific_poster", threshold: 10 },
        { id: "content_creator", threshold: 50 },
      ]

      for (const { id, threshold } of achievementsToCheck) {
        if (postCount >= threshold) {
          const unlocked = await this.unlockAchievement(id)
          if (unlocked) newAchievements.push(unlocked)
        }
      }
    } catch (error) {
      console.error("Error checking posting achievements:", error)
    }

    return newAchievements
  }

  private async checkEngagementAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    try {
      const likeCount = await prisma.like.count({
        where: { userId: this.userId },
      })

      const commentCount = await prisma.comment.count({
        where: { userId: this.userId },
      })

      // Like achievements
      if (likeCount >= 1) {
        const unlocked = await this.unlockAchievement("first_like")
        if (unlocked) newAchievements.push(unlocked)
      }

      if (likeCount >= 50) {
        const unlocked = await this.unlockAchievement("supportive")
        if (unlocked) newAchievements.push(unlocked)
      }

      // Comment achievements
      if (commentCount >= 1) {
        const unlocked = await this.unlockAchievement("first_comment")
        if (unlocked) newAchievements.push(unlocked)
      }
    } catch (error) {
      console.error("Error checking engagement achievements:", error)
    }

    return newAchievements
  }

  private async checkSocialAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    try {
      const followerCount = await prisma.follow.count({
        where: { followingId: this.userId },
      })

      const followingCount = await prisma.follow.count({
        where: { followerId: this.userId },
      })

      // Follower achievements
      if (followerCount >= 1) {
        const unlocked = await this.unlockAchievement("first_follower")
        if (unlocked) newAchievements.push(unlocked)
      }

      // Following achievements
      if (followingCount >= 1) {
        const unlocked = await this.unlockAchievement("first_follow")
        if (unlocked) newAchievements.push(unlocked)
      }
    } catch (error) {
      console.error("Error checking social achievements:", error)
    }

    return newAchievements
  }

  private async checkSubjectAchievements(): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []

    try {
      // Get posts with subject-related content
      const posts = await prisma.post.findMany({
        where: { userId: this.userId },
        select: { content: true },
      })

      let csCount = 0
      let mathCount = 0

      // Count posts by subject
      posts.forEach((post) => {
        const content = post.content.toLowerCase()

        if (this.containsCSTerms(content)) csCount++
        if (this.containsMathTerms(content)) mathCount++
      })

      // Check subject achievements
      if (csCount >= 5) {
        const unlocked = await this.unlockAchievement("cs_enthusiast")
        if (unlocked) newAchievements.push(unlocked)
      }

      if (mathCount >= 5) {
        const unlocked = await this.unlockAchievement("math_wizard")
        if (unlocked) newAchievements.push(unlocked)
      }
    } catch (error) {
      console.error("Error checking subject achievements:", error)
    }

    return newAchievements
  }

  private async unlockAchievement(achievementId: string): Promise<Achievement | null> {
    try {
      // Check if already unlocked
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId: this.userId,
            achievementId,
          },
        },
      })

      if (existing) return null

      // Get achievement details
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId },
      })

      if (!achievement) return null

      // Unlock the achievement
      await prisma.userAchievement.create({
        data: {
          userId: this.userId,
          achievementId,
          progress: 100,
          maxProgress: 100,
        },
      })

      return achievement
    } catch (error) {
      console.error("Error unlocking achievement:", error)
      return null
    }
  }

  private containsCSTerms(content: string): boolean {
    const csTerms = [
      "programming",
      "coding",
      "javascript",
      "python",
      "computer science",
      "computerscience",
      "software",
      "development",
      "#computerscience",
      "#programming",
      "#coding",
    ]
    return csTerms.some((term) => content.includes(term))
  }

  private containsMathTerms(content: string): boolean {
    const mathTerms = ["math", "mathematics", "calculus", "algebra", "equation", "formula", "#mathematics", "#math"]
    return mathTerms.some((term) => content.includes(term))
  }
}

// Helper function to check achievements for a user
export async function checkUserAchievements(userId: string): Promise<Achievement[]> {
  const checker = new AchievementChecker(userId)
  return await checker.checkAllAchievements()
}
