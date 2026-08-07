"use client";

import "stream-chat-react/dist/css/v2/index.css";
import { BookLoader } from "@/components/ui/book-loader";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";

export default function Chat() {
  const chatClient = useInitializeChatClient();

  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!chatClient) {
    return (
      <div className="flex min-h-[calc(100svh-10rem)] w-full items-center justify-center">
        <BookLoader label="Loading chat" size="3.5rem" />
      </div>
    );
  }

  return (
    <main className="rounded-modern-lg bg-card/50 shadow-medium border-border/50 animate-fadeIn relative h-[calc(100dvh-13rem-env(safe-area-inset-bottom))] min-h-88 w-full overflow-hidden border backdrop-blur-sm sm:h-[calc(100dvh-11rem-env(safe-area-inset-bottom))] sm:min-h-96 lg:h-[calc(100dvh-8rem)]">
      <div className="absolute top-0 bottom-0 flex w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
    </main>
  );
}
