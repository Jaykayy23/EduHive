"use client"

import {
  type InfiniteData,
  type QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast, useSonner } from "sonner";
import { submitPost } from "./actions";
import type { PostsPage } from "@/lib/types";
import { useSession } from "@/app/(main)/SessionProvider";
import { checkUserAchievements } from "@/lib/achievement-checker"
import { useState } from "react"
import type { Achievement } from "@prisma/client"

export function useSubmitPostMutation() {
  const {} = useSonner();

  const queryClient = useQueryClient();

  const { user } = useSession();

  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      })
       // Check for new achievements after posting
       try {
        const achievements = await checkUserAchievements(user.id)
        if (achievements.length > 0) {
          setNewAchievements(achievements)
        }
      } catch (error) {
        console.error("Error checking achievements:", error)
      }

      toast.success("Post created")
    },
    onError(error) {
      console.error(error);
      toast.error("Failed to post. Please try again");
    },
  });

  return { ...mutation, newAchievements, clearAchievements: () => setNewAchievements([]) }
}
