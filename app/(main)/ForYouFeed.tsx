"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import type { PostsPage, SubjectFilter } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BookLoader } from "@/components/ui/book-loader";

interface ForYouFeedProps {
  selectedSubject: SubjectFilter;
}

export default function ForYouFeed({ selectedSubject }: ForYouFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
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
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground mb-2 text-lg">
          No posts found for this subject yet.
        </p>
        <p className="text-muted-foreground text-sm">
          Be the first to share something about{" "}
          {selectedSubject === "all"
            ? "any subject"
            : selectedSubject.replace("-", " ")}
          !
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-center">
        An error occurred while loading posts.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && (
        <BookLoader className="mx-auto my-3" size="2rem" />
      )}
    </InfiniteScrollContainer>
  );
}
