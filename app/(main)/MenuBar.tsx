
import { Button } from "@/components/ui/button";
import { Bookmark, Bot, BrainCircuit, Home,  } from "lucide-react";
import Link from "next/link";
import streamServerClient from "@/lib/stream";
import { validateRequest } from "../auth";
import prisma from "@/lib/prisma";
import NotificationsButton from "./NotificationsButton";
import MessagesButton from "./MessagesButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
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
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/home">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationCount }}
      />
      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="EduHive Ai"
        asChild
      >
        <Link href="/chatbot">
          <Bot />
          <span className="hidden lg:inline">EduHive Ai</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="HiveQ"
        asChild
      >
        <Link href="/brainforge">
          <BrainCircuit />
          <span className="hidden lg:inline">HiveQ</span>
        </Link>
      </Button>

      
    </div>
  );
}
