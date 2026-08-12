"use client";

import { useState } from "react";
import Link from "next/link";

import FollowButton from "@/components/FollowButton";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { UserData } from "@/lib/types";

interface PeopleSuggestionsListProps {
  users: UserData[];
  variant: "desktop" | "mobile" | "grid";
}

export default function PeopleSuggestionsList({
  users,
  variant,
}: PeopleSuggestionsListProps) {
  const [hiddenUserIds, setHiddenUserIds] = useState<string[]>([]);
  const visibleUsers = users.filter((user) => !hiddenUserIds.includes(user.id));

  const hideAfterFollow = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      setHiddenUserIds((current) => [...current, userId]);
    }
  };

  const content = visibleUsers.map((suggestedUser) => (
    <article
      key={suggestedUser.id}
      className={cn(
        "flex min-w-0 items-center gap-3",
        variant === "desktop" && "justify-between",
        variant === "mobile" &&
          "w-60 shrink-0 snap-start flex-col items-stretch rounded-xl border bg-background p-4",
        variant === "grid" &&
          "flex-col items-stretch rounded-xl border bg-card p-5 shadow-sm",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 items-center gap-3",
          variant === "desktop" && "flex-1",
        )}
      >
        <UserTooltip user={suggestedUser}>
          <Link
            href={`/users/${suggestedUser.username}`}
            className="flex min-w-0 items-center gap-3"
          >
            <UserAvatar
              avatarUrl={suggestedUser.avatarUrl}
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold hover:underline">
                {suggestedUser.displayName}
              </p>
              <p className="text-muted-foreground truncate text-sm">
                @{suggestedUser.username}
              </p>
            </div>
          </Link>
        </UserTooltip>
      </div>

      {variant !== "desktop" && suggestedUser.bio && (
        <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
          {suggestedUser.bio}
        </p>
      )}

      <FollowButton
        userId={suggestedUser.id}
        initialState={{
          followers: suggestedUser._count.followers,
          isFollowedByUser: suggestedUser.followers.length > 0,
        }}
        onFollowChange={(isFollowing) =>
          hideAfterFollow(suggestedUser.id, isFollowing)
        }
      />
    </article>
  ));

  if (variant === "mobile") {
    return (
      <ScrollArea className="w-full pb-3">
        <div className="flex snap-x gap-3">{content}</div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        variant === "grid" && "grid sm:grid-cols-2",
      )}
    >
      {content}
    </div>
  );
}
