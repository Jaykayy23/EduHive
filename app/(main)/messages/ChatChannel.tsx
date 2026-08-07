import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  return (
    <div
      className={cn(
        "bg-card/30 h-full min-w-0 flex-1 backdrop-blur-sm md:block",
        !open && "hidden",
      )}
    >
      <Channel>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({
  openSidebar,
  ...props
}: CustomChannelHeaderProps) {
  return (
    <div className="border-border/50 bg-card/50 flex items-center gap-3 border-b p-3 sm:p-4">
      <Button
        size="icon"
        variant="ghost"
        onClick={openSidebar}
        aria-label="Open conversations"
        className="md:hidden"
      >
        <Menu data-icon="inline-start" />
      </Button>
      <ChannelHeader {...props} />
    </div>
  );
}
