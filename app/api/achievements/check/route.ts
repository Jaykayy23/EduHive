import { validateRequest } from "@/lib/auth-server"
import { checkUserAchievements } from "@/lib/achievement-checker"

export async function POST() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const newAchievements = await checkUserAchievements(user.id)

    return Response.json({ newAchievements })
  } catch (error) {
    console.error("Error checking achievements:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
