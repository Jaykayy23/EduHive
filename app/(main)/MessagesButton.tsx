"use client";

import { Button } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MessagesButtonProps {
  initialState: MessageCountInfo;
}

export default function MessagesButton({ initialState }: MessagesButtonProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/messages");

  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance.get("/api/messages/unread-count").json<MessageCountInfo>(),
    initialData: initialState,
    refetchInterval: 60 * 1000,
  });

  return (
    <Button
      variant="ghost"
      className={`flex-1 justify-center sm:w-full sm:justify-start gap-2 h-12 sm:h-14 text-left hover:bg-accent/60 transition-all duration-300 hover-lift group ${
        isActive ? "bg-primary/10 border border-primary/20" : ""
      }`}
      title="Messages"
      asChild
    >
      <Link href="/messages" className="flex items-center gap-2 sm:gap-4">
        <div className={`relative p-1.5 sm:p-2 rounded-premium-sm transition-colors duration-300 ${
          isActive 
            ? "bg-primary/20" 
            : "bg-muted/50 group-hover:bg-primary/20"
        }`}>
          <Mail className={`size-4 sm:size-5 transition-colors duration-300 ${
            isActive 
              ? "text-primary" 
              : "text-muted-foreground group-hover:text-primary"
          }`} />
          {!!data.unreadCount && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground shadow-soft">
              {data.unreadCount}
            </span>
          )}
        </div>
        <span className={`hidden sm:inline font-semibold transition-colors duration-300 ${
          isActive 
            ? "text-primary" 
            : "text-foreground group-hover:text-primary"
        }`}>Messages</span>
      </Link>
    </Button>
  );
}