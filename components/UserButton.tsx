"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import {
  Check,
  LogOutIcon,
  Monitor,
  Moon,
  SlidersHorizontal,
  Sun,
  UserIcon,
} from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();

  const { theme, setTheme } = useTheme();

  const queryClient = useQueryClient();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "hover:ring-primary/20 focus:ring-primary/50 flex-none rounded-full p-1 ring-2 ring-transparent transition-all duration-200 focus:ring-2 focus:outline-none",
            className,
          )}
          aria-label="User menu"
        >
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-card/95 border-border/50 shadow-strong rounded-modern-lg w-56 backdrop-blur-sm"
        align="end"
      >
        <DropdownMenuLabel className="text-muted-foreground px-3 py-2 text-sm font-medium">
          Logged in as @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />

        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer px-3 py-2 transition-colors duration-200">
            <UserIcon className="mr-3 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem
          asChild
          className="hover:bg-accent/50 cursor-pointer px-3 py-2 transition-colors duration-200"
        >
          <Link href="/onboarding">
            <SlidersHorizontal className="mr-3 size-4" />
            Personalization
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover:bg-accent/50 px-3 py-2 transition-colors duration-200">
            <Monitor className="mr-3 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="bg-card/95 border-border/50 shadow-strong rounded-modern-lg backdrop-blur-sm">
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="hover:bg-accent/50 cursor-pointer px-3 py-2 transition-colors duration-200"
              >
                <Monitor className="mr-3 size-4" />
                System default
                {theme === "system" && (
                  <Check className="text-primary ml-auto size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="hover:bg-accent/50 cursor-pointer px-3 py-2 transition-colors duration-200"
              >
                <Sun className="mr-3 size-4" />
                Light
                {theme === "light" && (
                  <Check className="text-primary ml-auto size-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="hover:bg-accent/50 cursor-pointer px-3 py-2 transition-colors duration-200"
              >
                <Moon className="mr-3 size-4" />
                Dark
                {theme === "dark" && (
                  <Check className="text-primary ml-auto size-4" />
                )}
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
          className="hover:bg-destructive/10 hover:text-destructive cursor-pointer px-3 py-2 transition-colors duration-200"
        >
          <LogOutIcon className="mr-3 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
