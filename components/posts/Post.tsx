"use client";

import { PostData } from "@/lib/types";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useSession } from "@/app/(main)/SessionProvider";
import PostMoreButton from "./PostMoreButton";
import Linkify from "../Linkify";
import UserTooltip from "../UserTooltip";
import { Media } from "@/lib/generated/prisma";
import Image from "next/image";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useState } from "react";
import { MessageSquare, X, Maximize2 } from "lucide-react";
import Comments from "../comments/Comments";
import { ReportButton } from "../ReportButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import StudyPostButton from "./StudyPostButton";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <article className="group/post glass rounded-premium-lg shadow-dramatic border-border/20 hover:shadow-epic hover:glass-strong animate-fadeIn hover-lift space-y-4 border p-4 transition-all duration-500 sm:space-y-6 sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-3 sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <UserTooltip user={post.user}>
            <Link
              href={`/users/${post.user.username}`}
              className="flex-shrink-0"
            >
              <UserAvatar
                avatarUrl={post.user.avatarUrl}
                className="group-hover/post:ring-primary/30 ring-2 ring-transparent transition-all duration-300 hover:scale-105"
              />
            </Link>
          </UserTooltip>

          <div className="min-w-0 flex-1">
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="text-foreground hover:text-primary block truncate text-base font-bold transition-colors duration-300 sm:text-lg"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>

            <Link
              href={`/posts/${post.id}`}
              className="text-muted-foreground hover:text-foreground block text-sm font-medium transition-colors duration-300"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-all duration-300 group-hover/post:opacity-100 sm:gap-3">
          {post.user.id === user.id && <PostMoreButton post={post} />}
          {post.user.id !== user.id && (
            <ReportButton reportedPostId={post.id} />
          )}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Linkify>
          <div className="text-foreground text-sm leading-relaxed font-medium break-words whitespace-pre-line sm:text-base">
            {post.content}
          </div>
        </Linkify>

        {!!post.attachments.length && (
          <div className="animate-slideUp">
            <MediaPreviews
              attachments={post.attachments}
              onImageClick={setSelectedImage}
            />
          </div>
        )}
      </div>

      <div className="border-border/20 flex items-center justify-between border-t pt-3 sm:pt-4">
        <div className="flex items-center gap-4 sm:gap-8">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
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
      </div>

      {showComments && (
        <div className="animate-slideUp border-border/20 border-t pt-4 sm:pt-6">
          <Comments post={post} />
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-h-[95vh] max-w-[95vw] border-0 bg-black/95 p-0 shadow-none sm:max-h-[90vh] sm:max-w-7xl">
            <DialogHeader className="sr-only">
              <DialogTitle>Full size image</DialogTitle>
            </DialogHeader>
            <div className="relative flex h-full w-full items-center justify-center p-2 sm:p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 z-50 rounded-full bg-black/50 p-2 text-white transition-colors duration-200 hover:bg-black/70 sm:top-4 sm:right-4"
                aria-label="Close image"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <Image
                src={selectedImage}
                alt="Full size image"
                width={1200}
                height={800}
                className="max-h-full max-w-full rounded-lg object-contain"
                priority
                unoptimized
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
  onImageClick: (imageUrl: string) => void;
}

function MediaPreviews({ attachments, onImageClick }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} onImageClick={onImageClick} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
  onImageClick: (imageUrl: string) => void;
}

function MediaPreview({ media, onImageClick }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <div
        className="group rounded-premium-lg shadow-dramatic hover:shadow-epic relative cursor-pointer overflow-hidden transition-all duration-500"
        onClick={() => onImageClick(media.url)}
      >
        <Image
          src={media.url}
          alt="Post attachment"
          width={500}
          height={500}
          className="h-auto max-h-[25rem] w-full object-cover transition-transform duration-500 group-hover:scale-110 sm:max-h-[35rem]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

        {/* Click to expand indicator */}
        <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:top-4 sm:right-4">
          <div className="rounded-full bg-black/50 p-1.5 text-white transition-colors duration-200 hover:bg-black/70 sm:p-2">
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        </div>
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className="group rounded-premium-lg shadow-dramatic hover:shadow-epic relative overflow-hidden transition-all duration-500">
        <video
          src={media.url}
          controls
          className="rounded-premium-lg h-auto max-h-[25rem] w-full object-cover sm:max-h-[35rem]"
          preload="metadata"
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="bg-destructive/10 border-destructive/20 rounded-premium text-destructive shadow-soft border p-4 text-xs font-medium sm:p-6 sm:text-sm">
      Unsupported media type
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-premium hover:bg-accent/60 focus:ring-primary/20 hover:shadow-soft flex items-center gap-2 p-2 transition-all duration-300 hover:scale-105 focus:ring-2 focus:outline-none sm:gap-3 sm:p-3"
      aria-label={`View ${post._count.comments} comments`}
    >
      <div className="rounded-premium-sm bg-primary/10 p-1 sm:p-1.5">
        <MessageSquare className="text-primary size-4 sm:size-5" />
      </div>
      <span className="text-foreground text-xs font-semibold tabular-nums sm:text-sm">
        {post._count.comments}
        <span className="ml-1 hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
