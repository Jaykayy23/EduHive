"use client"

import { useSession } from "@/app/(main)/SessionProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { Check, LogOutIcon, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

interface UserButtonProps {
  className?: string
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();

  const {theme, setTheme} = useTheme();

  const queryClient = useQueryClient();


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "flex-none rounded-full p-1 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50", 
            className
          )}
          aria-label="User menu"
        >
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-card/95 backdrop-blur-sm border-border/50 shadow-strong rounded-modern-lg"
        align="end"
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-medium text-muted-foreground">
          Logged in as @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        
        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem className="px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors duration-200">
            <UserIcon className="mr-3 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="px-3 py-2 hover:bg-accent/50 transition-colors duration-200">
            <Monitor className="mr-3 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-card/95 backdrop-blur-sm border-border/50 shadow-strong rounded-modern-lg">
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className="px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors duration-200"
              >
                <Monitor className="mr-3 size-4" />
                System default
                {theme === "system" && <Check className="ml-auto size-4 text-primary"/> }
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className="px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors duration-200"
              >
                <Sun className="mr-3 size-4" />
                Light
                {theme === "light" && <Check className="ml-auto size-4 text-primary"/> }
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className="px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors duration-200"
              >
                <Moon className="mr-3 size-4" />
                Dark
                {theme === "dark" && <Check className="ml-auto size-4 text-primary"/> }
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        <DropdownMenuItem
          onClick={() => {
            queryClient.clear();
            logout();
          }}
          className="px-3 py-2 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
        >
          <LogOutIcon className="mr-3 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
