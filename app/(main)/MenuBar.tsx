"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  BrainCircuit,
  Compass,
  Ellipsis,
  Home,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
  unreadNotificationCount?: number;
  unreadMessagesCount?: number;
}

interface MenuLinkProps {
  active: boolean;
  desktopOnly?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
}

const menuButtonClassName =
  "group hover-lift h-14 w-full min-w-0 flex-col justify-center gap-1 border border-transparent px-1 text-left transition-colors duration-200 hover:bg-accent/60 lg:flex-row lg:justify-start lg:gap-2 lg:px-4";

function MenuLink({
  active,
  desktopOnly = false,
  href,
  icon: Icon,
  label,
}: MenuLinkProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        menuButtonClassName,
        desktopOnly && "hidden lg:inline-flex",
        active && "border-primary/20 bg-primary/10",
      )}
      title={label}
      asChild
    >
      <Link href={href} aria-current={active ? "page" : undefined}>
        <div
          className={cn(
            "rounded-premium-sm bg-muted/50 group-hover:bg-primary/20 p-1.5 transition-colors duration-200 lg:p-2",
            active && "bg-primary/20",
          )}
        >
          <Icon
            data-icon="inline-start"
            className={cn(
              "text-muted-foreground group-hover:text-primary size-5 transition-colors duration-200",
              active && "text-primary",
            )}
          />
        </div>
        <span
          className={cn(
            "text-muted-foreground group-hover:text-primary lg:text-foreground max-w-full truncate text-[9px] leading-none font-medium tracking-[-0.03em] transition-colors duration-200 min-[360px]:text-[10px] lg:text-sm lg:leading-normal lg:font-semibold lg:tracking-normal",
            active && "text-primary",
          )}
        >
          {label}
        </span>
      </Link>
    </Button>
  );
}

export default function MenuBar({
  className,
  unreadNotificationCount = 0,
  unreadMessagesCount = 0,
}: MenuBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/" || pathname === "/home";
    }

    return pathname.startsWith(href);
  };

  const isMoreActive =
    isActive("/people") || isActive("/bookmarks") || isActive("/chatbot");

  return (
    <nav className={className} role="navigation" aria-label="Main navigation">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 lg:flex lg:max-w-2xl lg:flex-col lg:gap-0 lg:space-y-3">
        <MenuLink
          href="/home"
          label="Home"
          icon={Home}
          active={isActive("/home")}
        />

        <MenuLink
          href="/people"
          label="Discover"
          icon={Compass}
          active={isActive("/people")}
          desktopOnly
        />

        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationCount }}
        />

        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />

        <MenuLink
          href="/bookmarks"
          label="Bookmarks"
          icon={Bookmark}
          active={isActive("/bookmarks")}
          desktopOnly
        />

        <MenuLink
          href="/chatbot"
          label="EduHive Chatbot"
          icon={Bot}
          active={isActive("/chatbot")}
          desktopOnly
        />

        <MenuLink
          href="/hiveq"
          label="HiveQ"
          icon={BrainCircuit}
          active={isActive("/hiveq")}
        />

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                menuButtonClassName,
                "lg:hidden",
                isMoreActive && "border-primary/20 bg-primary/10",
              )}
              title="More"
              aria-label="More navigation"
              aria-current={isMoreActive ? "page" : undefined}
            >
              <div
                className={cn(
                  "rounded-premium-sm bg-muted/50 group-hover:bg-primary/20 p-1.5 transition-colors duration-200",
                  isMoreActive && "bg-primary/20",
                )}
              >
                <Ellipsis
                  data-icon="inline-start"
                  className={cn(
                    "text-muted-foreground group-hover:text-primary size-5 transition-colors duration-200",
                    isMoreActive && "text-primary",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-muted-foreground group-hover:text-primary text-[9px] leading-none font-medium tracking-[-0.03em] transition-colors duration-200 min-[360px]:text-[10px]",
                  isMoreActive && "text-primary",
                )}
              >
                More
              </span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="rounded-t-premium-lg border-border/60 bg-card shadow-dramatic pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto w-full max-w-lg">
              <SheetHeader className="px-4 pt-5 pb-2 text-left">
                <SheetTitle className="text-lg">More</SheetTitle>
                <SheetDescription>
                  Discover the community, study tools, and saved content.
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-2 px-4 pb-2">
                <SheetClose asChild>
                  <Link
                    href="/people"
                    aria-current={isActive("/people") ? "page" : undefined}
                    className={cn(
                      "rounded-premium border-border/70 bg-background/60 hover:border-primary/30 hover:bg-accent focus-visible:ring-ring/50 flex min-h-16 items-center gap-3 border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
                      isActive("/people") && "border-primary/30 bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-premium-sm bg-muted text-muted-foreground p-2.5",
                        isActive("/people") && "bg-primary/20 text-primary",
                      )}
                    >
                      <Compass className="size-5" aria-hidden="true" />
                    </span>
                    <span className="grid gap-0.5">
                      <span className="text-foreground font-semibold">
                        Discover
                      </span>
                      <span className="text-muted-foreground text-xs">
                        People and trending topics
                      </span>
                    </span>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/bookmarks"
                    aria-current={isActive("/bookmarks") ? "page" : undefined}
                    className={cn(
                      "rounded-premium border-border/70 bg-background/60 hover:border-primary/30 hover:bg-accent focus-visible:ring-ring/50 flex min-h-16 items-center gap-3 border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
                      isActive("/bookmarks") &&
                        "border-primary/30 bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-premium-sm bg-muted text-muted-foreground p-2.5",
                        isActive("/bookmarks") && "bg-primary/20 text-primary",
                      )}
                    >
                      <Bookmark className="size-5" aria-hidden="true" />
                    </span>
                    <span className="grid gap-0.5">
                      <span className="text-foreground font-semibold">
                        Bookmarks
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Posts you saved
                      </span>
                    </span>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link
                    href="/chatbot"
                    aria-current={isActive("/chatbot") ? "page" : undefined}
                    className={cn(
                      "rounded-premium border-border/70 bg-background/60 hover:border-primary/30 hover:bg-accent focus-visible:ring-ring/50 flex min-h-16 items-center gap-3 border p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2",
                      isActive("/chatbot") && "border-primary/30 bg-primary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-premium-sm bg-muted text-muted-foreground p-2.5",
                        isActive("/chatbot") && "bg-primary/20 text-primary",
                      )}
                    >
                      <Bot className="size-5" aria-hidden="true" />
                    </span>
                    <span className="grid gap-0.5">
                      <span className="text-foreground font-semibold">
                        EduHive Chatbot
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Ask the AI tutor
                      </span>
                    </span>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
