"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import type { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialState: LikeInfo;
}

export default function LikeButton({ postId, initialState }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast.error("Something went wrong");
    },
  });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="min-w-0 px-2.5 hover:translate-y-0 hover:shadow-none"
      onClick={() => mutate()}
      aria-pressed={data.isLikedByUser}
      aria-label={`${data.isLikedByUser ? "Unlike" : "Like"} this post. ${data.likes} ${data.likes === 1 ? "like" : "likes"}`}
    >
      <Heart
        data-icon="inline-start"
        className={cn(
          data.isLikedByUser && "fill-destructive text-destructive",
        )}
      />
      <span className="tabular-nums">{data.likes}</span>
      <span className="hidden sm:inline">
        {data.likes === 1 ? "Like" : "Likes"}
      </span>
    </Button>
  );
}
