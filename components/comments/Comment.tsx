import { useSession } from "@/app/(main)/SessionProvider";
import type { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import { ReportButton } from "../ReportButton";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex items-start gap-2.5">
      <UserTooltip user={comment.user}>
        <Link
          href={`/users/${comment.user.username}`}
          className="focus-visible:ring-ring/50 mt-1 shrink-0 rounded-full outline-none focus-visible:ring-2"
        >
          <UserAvatar avatarUrl={comment.user.avatarUrl} size={32} />
        </Link>
      </UserTooltip>

      <div className="border-border/60 bg-background min-w-0 flex-1 rounded-xl border px-3 py-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs">
          <UserTooltip user={comment.user}>
            <Link
              href={`/users/${comment.user.username}`}
              className="hover:text-primary truncate font-semibold transition-colors"
            >
              {comment.user.displayName}
            </Link>
          </UserTooltip>
          <span
            className="text-muted-foreground shrink-0"
            suppressHydrationWarning
          >
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 break-words whitespace-pre-line">
          {comment.content}
        </p>
      </div>

      {comment.user.id === user.id ? (
        <CommentMoreButton
          comment={comment}
          className="opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within/comment:opacity-100 sm:group-hover/comment:opacity-100"
        />
      ) : (
        <ReportButton
          reportedCommentId={comment.id}
          className="opacity-100 sm:opacity-0 sm:transition-opacity sm:group-focus-within/comment:opacity-100 sm:group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}
