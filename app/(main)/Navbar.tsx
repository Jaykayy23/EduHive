
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Session, User } from "lucia";

interface NavbarProps {
  session?: { user: User; session: Session } | { user: null; session: null };
}

export default function Navbar({ session }: NavbarProps) {
  const user = session?.user ?? null;

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-border/30 shadow-dramatic backdrop-blur-premium">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-4 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
              <Image
                src="/images/mylogo.png"
                alt="EduHive Logo"
                width={40}
                height={40}
                className="relative h-9 w-9 rounded-full shadow-medium transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-11 sm:w-11"
              />
              <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-gradient text-xl font-bold tracking-tight transition-transform duration-300 group-hover:scale-105 sm:text-2xl">
              EduHive
            </span>
          </Link>
          
          {/* Mobile User Button */}
          {user && (
            <div className="sm:hidden">
              <UserButton />
            </div>
          )}
        </div>
        
        {/* Search Field - Visible on all screen sizes */}
        {user && (
          <div className="mx-0 min-w-0 flex-1 sm:mx-6 sm:max-w-lg">
            <SearchField />
          </div>
        )}
        
        {/* Desktop User Actions */}
        {user ? (
          <div className="hidden items-center gap-4 sm:flex">
            <UserButton />
          </div>
        ) : (
          <div className="hidden items-center gap-3 sm:flex lg:gap-4">
            <Button asChild variant="ghost" size="sm" className="hover-lift lg:size-default">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="premium" size="sm" className="hover-glow lg:size-default">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
