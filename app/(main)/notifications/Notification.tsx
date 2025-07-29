import UserAvatar from "@/components/UserAvatar";
import { NotificationType } from "@/lib/generated/prisma";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import React from "react";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notication({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: React.ReactElement; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="text-primary size-7" />,
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="text-primary fill-primary size-7" />,
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "bg-card hover:bg-card/70 flex gap-3 rounded-2xl p-5 shadow-sm transition-colors",
          !notification.read && "bg-primary/10",
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">{notification.issuer.displayName}</span>{" "}
            <span>{message}</span>
          </div>
          {notification.post && (
            <div className="text-muted-foreground line-clamp-3 whitespace-pre-line">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
