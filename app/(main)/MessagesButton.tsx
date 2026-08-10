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
      className={`group hover-lift hover:bg-accent/60 h-14 w-full min-w-0 flex-col justify-center gap-1 border border-transparent px-1 text-left transition-colors duration-200 lg:flex-row lg:justify-start lg:gap-2 lg:px-4 ${
        isActive ? "border-primary/20 bg-primary/10" : ""
      }`}
      title="Messages"
      asChild
    >
      <Link href="/messages" aria-current={isActive ? "page" : undefined}>
        <div
          className={`rounded-premium-sm bg-muted/50 group-hover:bg-primary/20 relative p-1.5 transition-colors duration-200 lg:p-2 ${
            isActive ? "bg-primary/20" : ""
          }`}
        >
          <Mail
            data-icon="inline-start"
            className={`text-muted-foreground group-hover:text-primary size-5 transition-colors duration-200 ${
              isActive ? "text-primary" : ""
            }`}
          />
          {!!data.unreadCount && (
            <span className="shadow-soft bg-primary text-primary-foreground absolute -top-1 -right-1 min-w-4 rounded-full px-1 py-0.5 text-center text-[10px] leading-none font-semibold tabular-nums">
              {data.unreadCount > 99 ? "99+" : data.unreadCount}
            </span>
          )}
        </div>
        <span
          className={`text-muted-foreground group-hover:text-primary lg:text-foreground max-w-full truncate text-[9px] leading-none font-medium tracking-[-0.03em] transition-colors duration-200 min-[360px]:text-[10px] lg:text-sm lg:leading-normal lg:font-semibold lg:tracking-normal ${
            isActive ? "text-primary" : ""
          }`}
        >
          Messages
        </span>
      </Link>
    </Button>
  );
}
