import { validateRequest } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    })

    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { points: "asc" }],
    })

    return Response.json({
      userAchievements,
      allAchievements,
    })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
