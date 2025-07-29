"use client"

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer"
import Post from "@/components/posts/Post"
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton"
import kyInstance from "@/lib/ky"
import type { PostsPage, SubjectFilter } from "@/lib/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface ForYouFeedProps {
  selectedSubject: SubjectFilter
}

export default function ForYouFeed({ selectedSubject }: ForYouFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["post-feed", "for-you", selectedSubject],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/posts/for-you", {
          searchParams: {
            ...(pageParam ? { cursor: pageParam } : {}),
            ...(selectedSubject !== "all" ? { subject: selectedSubject } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (status === "pending") {
    return <PostsLoadingSkeleton />
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg mb-2">No posts found for this subject yet.</p>
        <p className="text-sm text-muted-foreground">
          Be the first to share something about{" "}
          {selectedSubject === "all" ? "any subject" : selectedSubject.replace("-", " ")}!
        </p>
      </div>
    )
  }

  if (status === "error") {
    return <p className="text-destructive text-center">An error occurred while loading posts.</p>
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  )
}
