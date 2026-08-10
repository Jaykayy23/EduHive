"use client";

import { ACADEMIC_SUBJECTS, type SubjectFilter } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SubjectFilterProps {
  selectedSubject: SubjectFilter;
  onSubjectChange: (subject: SubjectFilter) => void;
  className?: string;
}

export default function SubjectFilterComponent({
  selectedSubject,
  onSubjectChange,
  className,
}: SubjectFilterProps) {
  return (
    <div
      className={cn(
        "bg-card/90 border-border/70 relative overflow-hidden rounded-xl border shadow-xs backdrop-blur-sm sm:sticky sm:top-[5.25rem] sm:z-10",
        className,
      )}
    >
      <div
        className="scrollbar-hide flex w-full snap-x snap-proximity items-center gap-2 overflow-x-auto overscroll-x-contain px-2 py-2"
        role="group"
        aria-label="Filter posts by subject"
      >
        {ACADEMIC_SUBJECTS.map((subject) => (
          <Button
            key={subject.id}
            type="button"
            size="sm"
            variant={selectedSubject === subject.id ? "default" : "ghost"}
            onClick={() => onSubjectChange(subject.id)}
            aria-pressed={selectedSubject === subject.id}
            className="snap-start rounded-full px-3 hover:translate-y-0 hover:shadow-none sm:px-4"
          >
            <span aria-hidden="true" className="text-base">
              {subject.emoji}
            </span>
            <span>{subject.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
