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
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({
  userId,
  initialState,
  onFollowChange,
}: FollowButtonProps) {
  const {} = useSonner()
  const { user } = useSession()
  const queryClient = useQueryClient()
  const { data } = useFollowerInfo(userId, initialState)
  const queryKey: QueryKey = ["follower-info", userId]

  const { mutate } = useMutation({
    mutationFn: (shouldFollow: boolean) =>
      shouldFollow
        ? kyInstance.post(`/api/users/${userId}/followers`)
        : kyInstance.delete(`/api/users/${userId}/followers`),
    onMutate: async (shouldFollow) => {
      await queryClient.cancelQueries({ queryKey })
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey)

      queryClient.setQueryData<FollowerInfo>(queryKey, (currentState) => ({
        followers: Math.max(
          0,
          (currentState?.followers ?? initialState.followers) +
            (shouldFollow ? 1 : -1),
        ),
        isFollowedByUser: shouldFollow,
      }))

      return { previousState }
    },
    onSuccess: async (_response, shouldFollow) => {
      onFollowChange?.(shouldFollow)

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
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate(!data.isFollowedByUser)}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  )
}
