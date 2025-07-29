"use client"

import type { FollowerInfo } from "@/lib/types"
import { toast, useSonner } from "sonner"
import { Button } from "./ui/button"
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query"
import kyInstance from "@/lib/ky"
import useFollowerInfo from "@/app/hooks/useFollowerInfo"
import { useSession } from "@/app/(main)/SessionProvider"
import { checkUserAchievements } from "@/lib/achievement-checker"

interface FollowButtonProps {
  userId: string
  initialState: FollowerInfo
}

export default function FollowButton({ userId, initialState }: FollowButtonProps) {
  const {} = useSonner()
  const { user } = useSession()
  const queryClient = useQueryClient()
  const { data } = useFollowerInfo(userId, initialState)
  const queryKey: QueryKey = ["follower-info", userId]

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey)

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers: (previousState?.followers || 0) + (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }))

      return { previousState }
    },
    onSuccess: async () => {
      // Check for new achievements after following/unfollowing
      try {
        const achievements = await checkUserAchievements(user.id)
        if (achievements.length > 0) {
          console.log("New achievements unlocked:", achievements)
        }
      } catch (error) {
        console.error("Error checking achievements:", error)
      }
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState)
      console.error(error)
      toast.error("Something went wrong")
    },
  })

  return (
    <Button variant={data.isFollowedByUser ? "secondary" : "default"} onClick={() => mutate()}>
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  )
}
