"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, Bot, BrainCircuit, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationsButton from "./NotificationsButton";
import MessagesButton from "./MessagesButton";

interface MenuBarProps {
  className?: string;
  unreadNotificationCount?: number;
  unreadMessagesCount?: number;
}

export default function MenuBar({ 
  className, 
  unreadNotificationCount = 0, 
  unreadMessagesCount = 0 
}: MenuBarProps) {
  const pathname = usePathname();

  // Helper function to check if a menu item is active
  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/" || pathname === "/home";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={className} role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex max-w-2xl gap-1 lg:flex-col lg:space-y-3 lg:gap-0">
        <Button
          variant="ghost"
          className={`h-12 min-w-0 flex-1 justify-center gap-1 px-1 text-left transition-all duration-300 hover:bg-accent/60 lg:h-14 lg:w-full lg:justify-start lg:gap-2 lg:px-4 hover-lift group ${
            isActive("/home") ? "bg-primary/10 border border-primary/20" : ""
          }`}
          title="Home"
          asChild
        >
          <Link href="/home" className="flex items-center gap-1 lg:gap-4">
            <div className={`p-1.5 lg:p-2 rounded-premium-sm transition-colors duration-300 ${
              isActive("/home") 
                ? "bg-primary/20" 
                : "bg-muted/50 group-hover:bg-primary/20"
            }`}>
              <Home className={`size-5 transition-colors duration-300 ${
                isActive("/home") 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-primary"
              }`} />
            </div>
            <span className={`hidden lg:inline font-semibold transition-colors duration-300 ${
              isActive("/home") 
                ? "text-primary" 
                : "text-foreground group-hover:text-primary"
            }`}>Home</span>
          </Link>
        </Button>
        
        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationCount }}
        />
        
        <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />
        
        <Button
          variant="ghost"
          className={`h-12 min-w-0 flex-1 justify-center gap-1 px-1 text-left transition-all duration-300 hover:bg-accent/60 lg:h-14 lg:w-full lg:justify-start lg:gap-2 lg:px-4 hover-lift group ${
            isActive("/bookmarks") ? "bg-primary/10 border border-primary/20" : ""
          }`}
          title="Bookmarks"
          asChild
        >
          <Link href="/bookmarks" className="flex items-center gap-1 lg:gap-4">
            <div className={`p-1.5 lg:p-2 rounded-premium-sm transition-colors duration-300 ${
              isActive("/bookmarks") 
                ? "bg-primary/20" 
                : "bg-muted/50 group-hover:bg-primary/20"
            }`}>
              <Bookmark className={`size-5 transition-colors duration-300 ${
                isActive("/bookmarks") 
                  ? "text-primary" 
                  : "text-muted-foreground group-hover:text-primary"
              }`} />
            </div>
            <span className={`hidden lg:inline font-semibold transition-colors duration-300 ${
              isActive("/bookmarks") 
                ? "text-primary" 
                : "text-foreground group-hover:text-primary"
            }`}>Bookmarks</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={`h-12 min-w-0 flex-1 justify-center gap-1 px-1 text-left transition-all duration-300 hover:bg-accent/60 lg:h-14 lg:w-full lg:justify-start lg:gap-2 lg:px-4 hover-lift group ${
            isActive("/chatbot") ? "bg-primary/10 border border-primary/20" : ""
          }`}
          title="EduHive Chatbot"
          asChild
        >
          <Link href="/chatbot" className="flex items-center gap-1 lg:gap-4">
            <div className={`p-1.5 lg:p-2 rounded-premium-sm transition-colors duration-300 ${
              isActive("/chatbot") 
                ? "bg-primary/20" 
                : "bg-muted/50 group-hover:bg-primary/20"
            }`}>
              <Bot className={`size-5 transition-all duration-300 ${
                isActive("/chatbot") 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
              }`} />
            </div>
            <span className={`hidden lg:inline font-semibold transition-colors duration-300 ${
              isActive("/chatbot") 
                ? "text-primary" 
                : "text-foreground group-hover:text-primary"
            }`}>EduHive Chatbot</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={`h-12 min-w-0 flex-1 justify-center gap-1 px-1 text-left transition-all duration-300 hover:bg-accent/60 lg:h-14 lg:w-full lg:justify-start lg:gap-2 lg:px-4 hover-lift group ${
            isActive("/brainforge") ? "bg-primary/10 border border-primary/20" : ""
          }`}
          title="HiveQ"
          asChild
        >
          <Link href="/brainforge" className="flex items-center gap-1 lg:gap-4">
            <div className={`p-1.5 lg:p-2 rounded-premium-sm transition-colors duration-300 ${
              isActive("/brainforge") 
                ? "bg-primary/20" 
                : "bg-muted/50 group-hover:bg-primary/20"
            }`}>
              <BrainCircuit className={`size-5 transition-all duration-300 ${
                isActive("/brainforge") 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
              }`} />
            </div>
            <span className={`hidden lg:inline font-semibold transition-colors duration-300 ${
              isActive("/brainforge") 
                ? "text-primary" 
                : "text-foreground group-hover:text-primary"
            }`}>HiveQ</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}
