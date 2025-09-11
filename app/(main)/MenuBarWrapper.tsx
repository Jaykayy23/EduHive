import { validateRequest } from "../auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import MenuBar from "./MenuBar";

interface MenuBarWrapperProps {
  className?: string;
}

export default async function MenuBarWrapper({ className }: MenuBarWrapperProps) {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  const [unreadNotificationCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <MenuBar 
      className={className}
      unreadNotificationCount={unreadNotificationCount}
      unreadMessagesCount={unreadMessagesCount}
    />
  );
}
