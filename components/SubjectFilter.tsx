"use client";

import { ACADEMIC_SUBJECTS, type SubjectFilter } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollId = useId();
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateScrollControls = useCallback(() => {
    const row = scrollRef.current;
    if (!row) return;
    setCanScrollBack(row.scrollLeft > 1);
    setCanScrollForward(row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const row = scrollRef.current;
    if (!row) return;
    updateScrollControls();
    const observer = new ResizeObserver(updateScrollControls);
    observer.observe(row);
    return () => observer.disconnect();
  }, [updateScrollControls]);

  function scrollSubjects(direction: -1 | 1) {
    const row = scrollRef.current;
    if (!row) return;
    row.scrollBy({
      left: direction * Math.max(160, row.clientWidth * 0.75),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <div
      className={cn(
        "bg-card/90 border-border/70 relative flex min-w-0 items-center gap-1 overflow-hidden rounded-xl border px-1 shadow-xs backdrop-blur-sm sm:sticky sm:top-[5.25rem] sm:z-10",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Previous subjects"
        aria-controls={scrollId}
        disabled={!canScrollBack}
        onClick={() => scrollSubjects(-1)}
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <div
        ref={scrollRef}
        id={scrollId}
        onScroll={updateScrollControls}
        tabIndex={0}
        className="flex min-w-0 flex-1 snap-x snap-proximity scroll-px-1 items-center gap-2 overflow-x-auto overscroll-x-contain px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Next subjects"
        aria-controls={scrollId}
        disabled={!canScrollForward}
        onClick={() => scrollSubjects(1)}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </div>
  );
}
