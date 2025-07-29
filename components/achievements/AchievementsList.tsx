"use client"

import { useQuery } from "@tanstack/react-query"
import kyInstance from "@/lib/ky"
import AchievementBadge from "./AchievementBadge"
import { ACHIEVEMENT_CATEGORIES, RARITY_NAMES } from "@/lib/achievements"
import type { Achievement, UserAchievement } from "@/lib/achievements"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AchievementsData {
  userAchievements: (UserAchievement & { achievement: Achievement })[]
  allAchievements: Achievement[]
}

export default function AchievementsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => kyInstance.get("/api/achievements").json<AchievementsData>(),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading achievements...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Failed to load achievements</div>
      </div>
    )
  }

  if (!data) return null

  const { userAchievements, allAchievements } = data
  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement.id))

  const achievementsByCategory = allAchievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    },
    {} as Record<string, Achievement[]>,
  )

  const totalPoints = userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievements Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAchievements.length}</div>
            <p className="text-xs text-muted-foreground">of {allAchievements.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">Achievement points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((userAchievements.length / allAchievements.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(achievementsByCategory).map(([category, achievements]) => {
            const categoryInfo = ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES]
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{categoryInfo.emoji}</span>
                    {categoryInfo.name}
                  </CardTitle>
                  <CardDescription>
                    {achievements.filter((a) => unlockedIds.has(a.id)).length} of {achievements.length} unlocked
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex flex-col items-center space-y-2">
                        <AchievementBadge
                          achievement={achievement}
                          unlocked={unlockedIds.has(achievement.id)}
                          size="lg"
                        />
                        <div className="text-center">
                          <div className="text-sm font-medium">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {RARITY_NAMES[achievement.rarity]} • {achievement.points}pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="unlocked">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userAchievements.map((userAchievement) => (
              <div key={userAchievement.id} className="flex flex-col items-center space-y-2">
                <AchievementBadge achievement={userAchievement.achievement} unlocked={true} size="lg" />
                <div className="text-center">
                  <div className="text-sm font-medium">{userAchievement.achievement.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allAchievements
              .filter((achievement) => !unlockedIds.has(achievement.id))
              .map((achievement) => (
                <div key={achievement.id} className="flex flex-col items-center space-y-2">
                  <AchievementBadge achievement={achievement} unlocked={false} size="lg" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userAchievements.slice(0, 12).map((userAchievement) => (
              <div key={userAchievement.id} className="flex flex-col items-center space-y-2">
                <AchievementBadge achievement={userAchievement.achievement} unlocked={true} size="lg" />
                <div className="text-center">
                  <div className="text-sm font-medium">{userAchievement.achievement.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
