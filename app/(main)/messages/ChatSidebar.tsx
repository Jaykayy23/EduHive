import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, MailPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Event as StreamChatEvent } from "stream-chat";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { user } = useSession();

  const queryClient = useQueryClient();

  const { channel, client } = useChatContext();

  useEffect(() => {
    const syncUnreadCount = (event: StreamChatEvent) => {
      if (typeof event.total_unread_count === "number") {
        queryClient.setQueryData(["unread-messages-count"], {
          unreadCount: event.total_unread_count,
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    };

    const markReadSubscription = client.on(
      "notification.mark_read",
      syncUnreadCount,
    );
    const newMessageSubscription = client.on(
      "notification.message_new",
      syncUnreadCount,
    );
    const markUnreadSubscription = client.on(
      "notification.mark_unread",
      syncUnreadCount,
    );

    return () => {
      markReadSubscription.unsubscribe();
      newMessageSubscription.unsubscribe();
      markUnreadSubscription.unsubscribe();
    };
  }, [client, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          props.setActiveChannel?.(props.channel, props.watchers);
          onClose();
        }}
      />
    ),
    [onClose],
  );

  return (
    <div
      className={cn(
        "border-border/50 bg-card/30 size-full flex-col border-r backdrop-blur-sm md:flex md:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader hasActiveChannel={Boolean(channel)} onClose={onClose} />
      <div className="flex-1 overflow-hidden">
        <ChannelList
          filters={{
            type: "messaging",
            members: { $in: [user.id] },
          }}
          showChannelSearch
          options={{ state: true, presence: true, limit: 8 }}
          sort={{ last_message_at: -1 }}
          additionalChannelSearchProps={{
            searchForChannels: true,
            searchQueryParams: {
              channelFilters: {
                filters: { members: { $in: [user.id] } },
              },
            },
          }}
          Preview={ChannelPreviewCustom}
        />
      </div>
    </div>
  );
}

interface MenuHeaderProps {
  hasActiveChannel: boolean;
  onClose: () => void;
}

function MenuHeader({ hasActiveChannel, onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="border-border/50 bg-card/50 flex items-center gap-3 border-b p-3 sm:p-4">
        {hasActiveChannel && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Return to conversation"
            className="md:hidden"
          >
            <ChevronLeft data-icon="inline-start" />
          </Button>
        )}
        <h1 className="text-foreground me-auto text-xl font-bold md:ms-2">
          Messages
        </h1>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowNewChatDialog(true)}
          aria-label="Start new chat"
        >
          <MailPlus data-icon="inline-start" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
