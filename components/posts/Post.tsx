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

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();

  const [showComments, setShowComments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <article className="group/post glass space-y-4 sm:space-y-6 rounded-premium-lg p-4 sm:p-6 lg:p-8 shadow-dramatic border border-border/20 hover:shadow-epic hover:glass-strong transition-all duration-500 animate-fadeIn hover-lift">
      <div className="flex justify-between items-start gap-3 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`} className="flex-shrink-0">
              <UserAvatar avatarUrl={post.user.avatarUrl} className="ring-2 ring-transparent group-hover/post:ring-primary/30 transition-all duration-300 hover:scale-105" />
            </Link>
          </UserTooltip>

          <div className="flex-1 min-w-0">
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-bold text-foreground hover:text-primary transition-colors duration-300 truncate text-base sm:text-lg"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>

            <Link
              href={`/posts/${post.id}`}
              className="text-muted-foreground block text-sm hover:text-foreground transition-colors duration-300 font-medium"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 opacity-0 group-hover/post:opacity-100 transition-all duration-300">
          {post.user.id === user.id && (
            <PostMoreButton post={post} />
          )}
          {post.user.id !== user.id && (
            <ReportButton reportedPostId={post.id} />
          )}
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <Linkify>
          <div className="break-words whitespace-pre-line text-foreground leading-relaxed text-sm sm:text-base font-medium">
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
      
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/20">
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

        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      
      {showComments && (
        <div className="animate-slideUp border-t border-border/20 pt-4 sm:pt-6">
          <Comments post={post} />
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-7xl sm:max-h-[90vh] p-0 bg-black/95 border-0 shadow-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Full size image</DialogTitle>
            </DialogHeader>
            <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
                aria-label="Close image"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Image
                src={selectedImage}
                alt="Full size image"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg"
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
        className="relative group overflow-hidden rounded-premium-lg shadow-dramatic hover:shadow-epic transition-all duration-500 cursor-pointer"
        onClick={() => onImageClick(media.url)}
      >
        <Image
          src={media.url}
          alt="Post attachment"
          width={500}
          height={500}
          className="w-full h-auto max-h-[25rem] sm:max-h-[35rem] object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        {/* Click to expand indicator */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200">
            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className="relative group overflow-hidden rounded-premium-lg shadow-dramatic hover:shadow-epic transition-all duration-500">
        <video
          src={media.url}
          controls
          className="w-full h-auto max-h-[25rem] sm:max-h-[35rem] object-cover rounded-premium-lg"
          preload="metadata"
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-destructive/10 border border-destructive/20 rounded-premium text-destructive text-xs sm:text-sm font-medium shadow-soft">
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
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-premium hover:bg-accent/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:scale-105 hover:shadow-soft"
      aria-label={`View ${post._count.comments} comments`}
    >
      <div className="p-1 sm:p-1.5 rounded-premium-sm bg-primary/10">
        <MessageSquare className="size-4 sm:size-5 text-primary" />
      </div>
      <span className="text-xs sm:text-sm font-semibold tabular-nums text-foreground">
        {post._count.comments}
        <span className="hidden sm:inline ml-1">comments</span>
      </span>
    </button>
  );
}