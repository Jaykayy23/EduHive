"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpenCheck,
  CircleHelp,
  FileText,
  Layers3,
  Sparkles,
} from "lucide-react";
import kyInstance from "@/lib/ky";
import {
  getPreferredStudyMode,
  type PersonalizationResponse,
  type PreferredStudyMode,
} from "@/lib/personalization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const studyOptions = [
  {
    value: "explain",
    label: "Explain",
    description: "Build understanding with an example and a knowledge check.",
    icon: Sparkles,
  },
  {
    value: "summarize",
    label: "Summarize",
    description: "Turn the post into concise, exam-ready notes.",
    icon: FileText,
  },
  {
    value: "flashcards",
    label: "Flashcards",
    description: "Create quick prompts and answers for revision.",
    icon: Layers3,
  },
  {
    value: "quiz",
    label: "Quiz me",
    description: "Test recall, application, and reasoning.",
    icon: CircleHelp,
  },
] as const;

interface StudyPostButtonProps {
  postId: string;
  postPreview: string;
}

export default function StudyPostButton({
  postId,
  postPreview,
}: StudyPostButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chosenMode, setChosenMode] = useState<PreferredStudyMode | null>(null);
  const { data: preferences } = useQuery({
    queryKey: ["personalization"],
    queryFn: () =>
      kyInstance.get("/api/personalization").json<PersonalizationResponse>(),
    enabled: open,
    staleTime: Infinity,
  });

  const mode =
    chosenMode ??
    (preferences ? getPreferredStudyMode(preferences.studyModes) : "summarize");

  const selectedOption =
    studyOptions.find((option) => option.value === mode) ?? studyOptions[1];

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setChosenMode(null);
  }

  function startStudying() {
    setOpen(false);
    router.push(`/chatbot?study=${encodeURIComponent(postId)}&mode=${mode}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="hover:translate-y-0 hover:shadow-none"
        >
          <BookOpenCheck data-icon="inline-start" />
          Study
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Study this post</DialogTitle>
          <DialogDescription>
            EduHive AI will use the post as source material and open a new,
            saved study conversation.
          </DialogDescription>
        </DialogHeader>

        <Card className="gap-3 py-4">
          <CardHeader className="gap-1 px-4">
            <CardTitle className="text-sm">Source post</CardTitle>
            <CardDescription className="line-clamp-2">
              {postPreview}
            </CardDescription>
          </CardHeader>
        </Card>

        <FieldSet>
          <FieldLegend>Choose a study format</FieldLegend>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(nextMode) => {
              if (!nextMode) return;
              setChosenMode(nextMode as PreferredStudyMode);
            }}
            variant="outline"
            spacing={2}
            className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Study format"
          >
            {studyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="w-full justify-start"
                >
                  <Icon />
                  {option.label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <FieldDescription>{selectedOption.description}</FieldDescription>
        </FieldSet>

        <DialogFooter>
          <Button type="button" onClick={startStudying}>
            <BookOpenCheck data-icon="inline-start" />
            Start studying
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
