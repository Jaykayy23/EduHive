"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Media } from "@/lib/generated/prisma";
import type { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Maximize2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BookmarkButton from "./BookmarkButton";
import Comments from "../comments/Comments";
import LikeButton from "./LikeButton";
import Linkify from "../Linkify";
import PostMoreButton from "./PostMoreButton";
import { ReportButton } from "../ReportButton";
import StudyPostButton from "./StudyPostButton";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const commentsRegionId = `post-${post.id}-comments`;
  const authorHeadingId = `post-${post.id}-author`;

  return (
    <article aria-labelledby={authorHeadingId}>
      <Card className="group/post rounded-premium border-border/70 bg-card/95 shadow-soft hover:shadow-medium gap-0 overflow-hidden py-0 transition-shadow duration-200">
        <CardHeader className="border-border/60 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-1 items-center gap-3 border-b px-4 py-4 sm:px-5 [.border-b]:pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="focus-visible:ring-ring/50 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <UserAvatar
                  avatarUrl={post.user.avatarUrl}
                  size={44}
                  className="ring-border ring-1 transition-opacity hover:opacity-90"
                />
              </Link>
            </UserTooltip>

            <div className="min-w-0">
              <CardTitle
                id={authorHeadingId}
                className="truncate text-sm leading-tight sm:text-base"
              >
                <UserTooltip user={post.user}>
                  <Link
                    href={`/users/${post.user.username}`}
                    className="hover:text-primary focus-visible:text-primary transition-colors outline-none"
                  >
                    {post.user.displayName}
                  </Link>
                </UserTooltip>
              </CardTitle>
              <CardDescription className="mt-1 flex min-w-0 items-center gap-1.5 text-xs">
                <Link
                  href={`/users/${post.user.username}`}
                  className="hover:text-foreground truncate transition-colors"
                >
                  @{post.user.username}
                </Link>
                <span aria-hidden="true">&middot;</span>
                <Link
                  href={`/posts/${post.id}`}
                  className="hover:text-foreground shrink-0 transition-colors"
                  suppressHydrationWarning
                >
                  {formatRelativeDate(post.createdAt)}
                </Link>
              </CardDescription>
            </div>
          </div>

          <CardAction className="col-start-2 row-span-1 row-start-1 flex items-center self-center">
            {post.user.id === user.id ? (
              <PostMoreButton post={post} />
            ) : (
              <ReportButton reportedPostId={post.id} />
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-4 py-4 sm:gap-5 sm:px-5 sm:py-5">
          <Linkify>
            <div className="text-card-foreground text-[0.95rem] leading-7 break-words whitespace-pre-line sm:text-base">
              {post.content}
            </div>
          </Linkify>

          {!!post.attachments.length && (
            <MediaPreviews
              attachments={post.attachments}
              authorName={post.user.displayName}
              onImageClick={setSelectedImage}
            />
          )}
        </CardContent>

        <CardFooter className="border-border/60 bg-muted/25 justify-between gap-2 border-t px-2 py-2 sm:px-3 [.border-t]:pt-2">
          <div className="flex min-w-0 items-center gap-0.5">
            <LikeButton
              postId={post.id}
              initialState={{
                likes: post._count.likes,
                isLikedByUser: post.likes.some(
                  (like) => like.userId === user.id,
                ),
              }}
            />
            <CommentButton
              count={post._count.comments}
              expanded={showComments}
              controls={commentsRegionId}
              onClick={() => setShowComments((current) => !current)}
            />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <StudyPostButton postId={post.id} postPreview={post.content} />
            <BookmarkButton
              postId={post.id}
              initialState={{
                isBookmarkedByUser: post.bookmarks.some(
                  (bookmark) => bookmark.userId === user.id,
                ),
              }}
            />
          </div>
        </CardFooter>

        {showComments && (
          <CardContent
            id={commentsRegionId}
            className="border-border/60 bg-muted/15 border-t px-4 py-4 sm:px-5"
          >
            <Comments post={post} />
          </CardContent>
        )}
      </Card>

      <Dialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="border-border/70 bg-card max-h-[95vh] max-w-[95vw] overflow-hidden p-2 shadow-2xl sm:max-h-[92vh] sm:max-w-6xl sm:p-3">
          <DialogHeader className="sr-only">
            <DialogTitle>Full-size post attachment</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Full-size post attachment"
              width={1600}
              height={1200}
              className="max-h-[calc(95vh-1rem)] w-full rounded-lg object-contain sm:max-h-[calc(92vh-1.5rem)]"
              priority
              unoptimized
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
  authorName: string;
  onImageClick: (imageUrl: string) => void;
}

function MediaPreviews({
  attachments,
  authorName,
  onImageClick,
}: MediaPreviewsProps) {
  const isSingle = attachments.length === 1;

  return (
    <div
      className={cn(
        "grid gap-1.5 overflow-hidden rounded-xl",
        !isSingle && "grid-cols-2",
      )}
    >
      {attachments.map((media, index) => (
        <MediaPreview
          key={media.id}
          media={media}
          authorName={authorName}
          isSingle={isSingle}
          featured={attachments.length === 3 && index === 0}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
  authorName: string;
  isSingle: boolean;
  featured: boolean;
  onImageClick: (imageUrl: string) => void;
}

function MediaPreview({
  media,
  authorName,
  isSingle,
  featured,
  onImageClick,
}: MediaPreviewProps) {
  const frameClassName = cn(
    "group/media relative isolate overflow-hidden bg-muted",
    isSingle ? "aspect-[16/10] max-h-[34rem]" : "aspect-square",
    featured && "row-span-2 aspect-auto min-h-full",
  );

  if (media.type === "IMAGE") {
    return (
      <button
        type="button"
        className={cn(
          frameClassName,
          "focus-visible:ring-ring/60 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset",
        )}
        onClick={() => onImageClick(media.url)}
        aria-label={`Open image attachment from ${authorName}`}
      >
        <Image
          src={media.url}
          alt={`Post attachment from ${authorName}`}
          fill
          sizes={
            isSingle
              ? "(max-width: 768px) 100vw, 640px"
              : "(max-width: 768px) 50vw, 320px"
          }
          className="object-cover transition-opacity duration-200 group-hover/media:opacity-95"
          unoptimized
        />
        <span className="bg-background/85 text-foreground shadow-soft absolute top-2 right-2 rounded-full p-2 opacity-90 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100 sm:group-focus-visible/media:opacity-100">
          <Maximize2 className="size-4" aria-hidden="true" />
        </span>
      </button>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className={frameClassName}>
        <video
          src={media.url}
          controls
          className="size-full object-cover"
          preload="metadata"
          playsInline
          aria-label={`Video attachment from ${authorName}`}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="border-destructive/30 bg-destructive/10 text-destructive flex min-h-28 items-center justify-center rounded-xl border p-4 text-sm font-medium">
      This attachment type is not supported.
    </div>
  );
}

interface CommentButtonProps {
  count: number;
  expanded: boolean;
  controls: string;
  onClick: () => void;
}

function CommentButton({
  count,
  expanded,
  controls,
  onClick,
}: CommentButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="min-w-0 px-2.5 hover:translate-y-0 hover:shadow-none"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={`${expanded ? "Hide" : "View"} ${count} ${count === 1 ? "comment" : "comments"}`}
    >
      <MessageCircle data-icon="inline-start" />
      <span className="tabular-nums">{count}</span>
      <span className="hidden sm:inline">
        {count === 1 ? "Comment" : "Comments"}
      </span>
    </Button>
  );
}
