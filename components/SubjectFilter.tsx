"use client"

import { ACADEMIC_SUBJECTS, type SubjectFilter } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SubjectFilterProps {
  selectedSubject: SubjectFilter
  onSubjectChange: (subject: SubjectFilter) => void
  className?: string
}

export default function SubjectFilterComponent({ selectedSubject, onSubjectChange, className }: SubjectFilterProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  return (
    <div className={cn("sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b", className)}>
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide py-3 px-1"
        onScroll={(e) => setIsScrolled(e.currentTarget.scrollLeft > 0)}
      >
        {/* Gradient overlay for scroll indication */}
        {isScrolled && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        )}

        {ACADEMIC_SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSubjectChange(subject.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105",
              selectedSubject === subject.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-base">{subject.emoji}</span>
            <span>{subject.name}</span>
          </button>
        ))}

        {/* Right gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
