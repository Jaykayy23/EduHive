"use client";

import { UsersRound } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

import PeopleSuggestionsList from "@/components/people/PeopleSuggestionsList";
import { BookLoader } from "@/components/ui/book-loader";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import kyInstance from "@/lib/ky";
import type { UsersPage } from "@/lib/types";

export default function PeopleDiscovery() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["people-suggestions"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/users/suggestions", {
          searchParams: pageParam ? { cursor: pageParam } : {},
        })
        .json<UsersPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const users = data?.pages.flatMap((page) => page.users) ?? [];

  if (status === "pending") {
    return <BookLoader className="mx-auto my-10" size="2.5rem" />;
  }

  if (status === "error") {
    return (
      <p className="text-destructive py-10 text-center">
        We couldn&apos;t load people right now. Please try again.
      </p>
    );
  }

  if (!users.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersRound />
          </EmptyMedia>
          <EmptyTitle>You&apos;re all caught up</EmptyTitle>
          <EmptyDescription>
            There are no new people to suggest right now.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PeopleSuggestionsList users={users} variant="grid" />
      {hasNextPage && (
        <Button
          className="self-center"
          variant="outline"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading people…" : "Load more people"}
        </Button>
      )}
    </div>
  );
}
