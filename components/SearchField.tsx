"use client";

import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

export default function SearchField() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
     e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement ).value.trim();
    if (!q) return;
    
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }
  return (
    <form onSubmit={handleSubmit} method="GET" action="/search" className="w-full">
      <div className="relative group">
        <Input 
          name="q" 
          placeholder="Search EduHive..." 
          className="w-full pl-4 pr-12 h-10 sm:pl-5 sm:pr-14 sm:h-12 rounded-premium border-border/30 bg-card/60 backdrop-blur-premium focus:bg-card focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-soft focus:shadow-medium hover:shadow-soft text-sm sm:text-base" 
        />
        <button
          type="submit"
          className="absolute top-1/2 right-3 sm:right-4 -translate-y-1/2 p-1.5 sm:p-2 rounded-premium-sm hover:bg-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:scale-110"
          aria-label="Search"
        >
          <SearchIcon className="text-muted-foreground size-4 sm:size-5 group-hover:text-primary transition-colors duration-300" />
        </button>
      </div>
    </form>
  );
}
