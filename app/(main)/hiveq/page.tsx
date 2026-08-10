"use client";

import { useState } from "react";
import { BrainCircuit } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { InputSection, type QuizSource } from "./components/1-input-section";
import { ConfigurationSection } from "./components/2-configuration-section";
import { ResultsSection } from "./components/3-results-section";
import type { GeneratedResponse } from "./types";

type HiveQView = "build" | "quiz";

export default function HiveQPage() {
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [mcqPercentage, setMcqPercentage] = useState(50);
  const [trueFalsePercentage, setTrueFalsePercentage] = useState(50);
  const [fillInPercentage, setFillInPercentage] = useState(0);
  const [source, setSource] = useState<QuizSource | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [activeView, setActiveView] = useState<HiveQView>("build");
  const [isLoading, setIsLoading] = useState(false);
  const [generationVersion, setGenerationVersion] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] =
    useState<GeneratedResponse | null>(null);

  const handlePercentageChange = (
    type: "mcq" | "trueFalse" | "fillIn",
    value: number,
  ) => {
    let newMcq = mcqPercentage;
    let newTrueFalse = trueFalsePercentage;
    let newFillIn = fillInPercentage;
    const nextValue = Math.max(0, Math.min(100, value));

    if (type === "mcq") {
      newMcq = nextValue;
      const remaining = 100 - newMcq;
      const otherTotal = newTrueFalse + newFillIn;
      if (otherTotal > 0) {
        newTrueFalse = Math.round(remaining * (newTrueFalse / otherTotal));
        newFillIn = remaining - newTrueFalse;
      } else {
        newTrueFalse = Math.floor(remaining / 2);
        newFillIn = remaining - newTrueFalse;
      }
    } else if (type === "trueFalse") {
      newTrueFalse = nextValue;
      const remaining = 100 - newTrueFalse;
      const otherTotal = newMcq + newFillIn;
      if (otherTotal > 0) {
        newMcq = Math.round(remaining * (newMcq / otherTotal));
        newFillIn = remaining - newMcq;
      } else {
        newMcq = Math.floor(remaining / 2);
        newFillIn = remaining - newMcq;
      }
    } else {
      newFillIn = nextValue;
      const remaining = 100 - newFillIn;
      const otherTotal = newMcq + newTrueFalse;
      if (otherTotal > 0) {
        newMcq = Math.round(remaining * (newMcq / otherTotal));
        newTrueFalse = remaining - newMcq;
      } else {
        newMcq = Math.floor(remaining / 2);
        newTrueFalse = remaining - newMcq;
      }
    }

    setMcqPercentage(newMcq);
    setTrueFalsePercentage(newTrueFalse);
    setFillInPercentage(newFillIn);
  };

  const handleGenerate = async () => {
    if (!source) {
      toast.error("Add valid study material before generating a quiz.");
      return;
    }

    setIsLoading(true);

    try {
      let response: Response;
      if (source.type === "text") {
        response = await fetch("/api/hiveq/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text_input: source.content,
            total_questions: totalQuestions,
            mcq_percentage: mcqPercentage / 100,
            true_false_percentage: trueFalsePercentage / 100,
            fill_in_percentage: fillInPercentage / 100,
          }),
        });
      } else {
        const formData = new FormData();
        formData.append("file", source.content);
        formData.append("total_questions", totalQuestions.toString());
        formData.append(
          "question_distribution_json",
          JSON.stringify({
            mcq: mcqPercentage / 100,
            true_false: trueFalsePercentage / 100,
            fill_in: fillInPercentage / 100,
          }),
        );
        response = await fetch("/api/hiveq/file", {
          method: "POST",
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "An unknown error occurred" }));
        throw new Error(errorData.detail || "Failed to generate questions");
      }

      const data: GeneratedResponse = await response.json();
      setGeneratedQuestions(data);
      setGenerationVersion((version) => version + 1);
      setActiveView("quiz");
      toast.success(`Generated ${data.questions.length} questions.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedQuestions(null);
    setSource(null);
    setTotalQuestions(10);
    setMcqPercentage(50);
    setTrueFalsePercentage(50);
    setFillInPercentage(0);
    setResetVersion((version) => version + 1);
    setActiveView("build");
    toast.success("HiveQ is ready for new study material.");
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-xl shadow-sm">
            <BrainCircuit className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-primary text-sm font-medium">HiveQ</p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Turn notes into a focused quiz
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
              Choose your source, shape the question mix, then generate when
              everything looks right.
            </p>
          </div>
        </div>
      </header>

      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as HiveQView)}
        className="gap-5"
      >
        <TabsList className="w-full sm:ml-auto sm:w-auto sm:min-w-80">
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="quiz" disabled={!generatedQuestions}>
            Question preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build">
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,.8fr)]">
            <InputSection key={resetVersion} onSourceChange={setSource} />
            <ConfigurationSection
              totalQuestions={totalQuestions}
              setTotalQuestions={setTotalQuestions}
              mcqPercentage={mcqPercentage}
              trueFalsePercentage={trueFalsePercentage}
              fillInPercentage={fillInPercentage}
              handlePercentageChange={handlePercentageChange}
              canGenerate={source !== null}
              isLoading={isLoading}
              onGenerate={handleGenerate}
              onReset={handleReset}
            />
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          {generatedQuestions && (
            <ResultsSection
              key={generationVersion}
              generatedQuestions={generatedQuestions}
              onEditSetup={() => setActiveView("build")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
