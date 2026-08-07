"use client";

import { Minus, Plus, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BookLoader } from "@/components/ui/book-loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

interface ConfigurationSectionProps {
  totalQuestions: number;
  setTotalQuestions: (value: number) => void;
  mcqPercentage: number;
  trueFalsePercentage: number;
  fillInPercentage: number;
  handlePercentageChange: (
    type: "mcq" | "trueFalse" | "fillIn",
    value: number,
  ) => void;
  canGenerate: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

function allocateQuestionCounts(
  total: number,
  distribution: Record<"mcq" | "trueFalse" | "fillIn", number>,
) {
  const keys = ["mcq", "trueFalse", "fillIn"] as const;
  const raw = Object.fromEntries(
    keys.map((key) => [key, (total * distribution[key]) / 100]),
  ) as Record<(typeof keys)[number], number>;
  const counts = Object.fromEntries(
    keys.map((key) => [key, Math.floor(raw[key])]),
  ) as Record<(typeof keys)[number], number>;
  let remaining = total - keys.reduce((sum, key) => sum + counts[key], 0);

  const priority = [...keys].sort(
    (first, second) =>
      raw[second] - counts[second] - (raw[first] - counts[first]),
  );
  let index = 0;
  while (remaining > 0) {
    counts[priority[index % priority.length]] += 1;
    remaining -= 1;
    index += 1;
  }

  return counts;
}

export function ConfigurationSection({
  totalQuestions,
  setTotalQuestions,
  mcqPercentage,
  trueFalsePercentage,
  fillInPercentage,
  handlePercentageChange,
  canGenerate,
  isLoading,
  onGenerate,
  onReset,
}: ConfigurationSectionProps) {
  const counts = allocateQuestionCounts(totalQuestions, {
    mcq: mcqPercentage,
    trueFalse: trueFalsePercentage,
    fillIn: fillInPercentage,
  });

  const changeTotal = (difference: number) => {
    setTotalQuestions(Math.max(5, Math.min(50, totalQuestions + difference)));
  };

  const questionTypes = [
    {
      key: "mcq" as const,
      label: "Multiple choice",
      description: "Four options for quick recall",
      percentage: mcqPercentage,
      count: counts.mcq,
    },
    {
      key: "trueFalse" as const,
      label: "True or false",
      description: "Direct checks for facts and misconceptions",
      percentage: trueFalsePercentage,
      count: counts.trueFalse,
    },
    {
      key: "fillIn" as const,
      label: "Fill in the blank",
      description: "Short responses without answer choices",
      percentage: fillInPercentage,
      count: counts.fillIn,
    },
  ];

  return (
    <Card className="min-w-0 lg:sticky lg:top-20 lg:self-start">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg text-sm">
            2
          </span>
          Shape your quiz
        </CardTitle>
        <CardDescription>
          Set the length and question mix before generating.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <section
          aria-labelledby="hiveq-total-label"
          className="flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p id="hiveq-total-label" className="text-sm font-medium">
                Total questions
              </p>
              <p className="text-muted-foreground text-xs">
                Choose from 5 to 50.
              </p>
            </div>
            <div className="bg-muted flex items-center rounded-lg border p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => changeTotal(-1)}
                disabled={isLoading || totalQuestions <= 5}
                aria-label="Decrease total questions"
              >
                <Minus aria-hidden="true" />
              </Button>
              <output
                className="min-w-10 text-center text-sm font-semibold tabular-nums"
                aria-live="polite"
              >
                {totalQuestions}
              </output>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => changeTotal(1)}
                disabled={isLoading || totalQuestions >= 50}
                aria-label="Increase total questions"
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        <fieldset className="flex min-w-0 flex-col gap-5">
          <legend className="mb-1 text-sm font-medium">Question mix</legend>
          {questionTypes.map((questionType, index) => (
            <div key={questionType.key} className="flex min-w-0 flex-col gap-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <label
                    htmlFor={`hiveq-${questionType.key}-slider`}
                    className="text-sm font-medium"
                  >
                    {questionType.label}
                  </label>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {questionType.description}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0 tabular-nums">
                  {questionType.count}{" "}
                  {questionType.count === 1 ? "question" : "questions"}
                </Badge>
              </div>
              <Slider
                id={`hiveq-${questionType.key}-slider`}
                value={[questionType.percentage]}
                onValueChange={(value) =>
                  handlePercentageChange(questionType.key, value[0])
                }
                min={0}
                max={100}
                step={5}
                disabled={isLoading}
                aria-label={`${questionType.label} percentage`}
              />
              <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
                <span>0%</span>
                <span>{questionType.percentage}%</span>
                <span>100%</span>
              </div>
              {index < questionTypes.length - 1 && <Separator />}
            </div>
          ))}
        </fieldset>
      </CardContent>

      <CardFooter className="flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
        >
          {isLoading ? (
            <>
              <BookLoader size="1rem" />
              Generating questions...
            </>
          ) : (
            <>
              <Sparkles data-icon="inline-start" aria-hidden="true" />
              Generate {totalQuestions} questions
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={isLoading}
        >
          <RefreshCw data-icon="inline-start" aria-hidden="true" />
          Reset builder
        </Button>
        {!canGenerate && (
          <p className="text-muted-foreground text-center text-xs">
            Add valid study material to enable generation.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
