// brainforge/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Brain, Sparkles } from "lucide-react";

import { InputSection } from "./components/1-input-section";
import { ConfigurationSection } from "./components/2-configuration-section";
import { ResultsSection } from "./components/3-results-section";
import type { GeneratedResponse } from "./types";

export default function BrainForgePage() {
  // Configuration State
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [mcqPercentage, setMcqPercentage] = useState(50);
  const [trueFalsePercentage, setTrueFalsePercentage] = useState(50);
  const [fillInPercentage, setFillInPercentage] = useState(0);

  // API/Data State
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] =
    useState<GeneratedResponse | null>(null);

  const handlePercentageChange = (
    type: "mcq" | "trueFalse" | "fillIn",
    value: number,
  ) => {
    let newMcq = mcqPercentage,
      newTf = trueFalsePercentage,
      newFib = fillInPercentage;
    const setValue = Math.max(0, Math.min(100, value));

    if (type === "mcq") {
      newMcq = setValue;
      const remaining = 100 - newMcq;
      const otherTotal = newTf + newFib;
      if (otherTotal > 0) {
        newTf = Math.round(remaining * (newTf / otherTotal));
        newFib = remaining - newTf;
      } else {
        newTf = Math.floor(remaining / 2);
        newFib = remaining - newTf;
      }
    } else if (type === "trueFalse") {
      newTf = setValue;
      const remaining = 100 - newTf;
      const otherTotal = newMcq + newFib;
      if (otherTotal > 0) {
        newMcq = Math.round(remaining * (newMcq / otherTotal));
        newFib = remaining - newMcq;
      } else {
        newMcq = Math.floor(remaining / 2);
        newFib = remaining - newMcq;
      }
    } else {
      // fillIn
      newFib = setValue;
      const remaining = 100 - newFib;
      const otherTotal = newMcq + newTf;
      if (otherTotal > 0) {
        newMcq = Math.round(remaining * (newMcq / otherTotal));
        newTf = remaining - newMcq;
      } else {
        newMcq = Math.floor(remaining / 2);
        newTf = remaining - newMcq;
      }
    }
    setMcqPercentage(newMcq);
    setTrueFalsePercentage(newTf);
    setFillInPercentage(newFib);
  };

  const handleGenerate = async (
    source: { type: "text"; content: string } | { type: "file"; content: File },
  ) => {
    setIsLoading(true);
    setGeneratedQuestions(null);

    try {
      let response: Response;
      if (source.type === "text") {
        response = await fetch("http://localhost:8000/generate-from-text/", {
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
        // file
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
        response = await fetch("http://localhost:8000/generate-from-file/", {
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
      toast.success(
        `Successfully generated ${data.questions.length} questions!`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedQuestions(null);
    setTotalQuestions(10);
    setMcqPercentage(50);
    setTrueFalsePercentage(50);
    setFillInPercentage(0);
    toast.success("Form reset successfully!");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Brain className="text-primary h-8 w-8" />
          <h1 className="from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
            HiveQ
          </h1>
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Transform your educational content into intelligent questions using
          advanced AI. Upload documents or paste text to generate customized
          quizzes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InputSection
            isLoading={isLoading}
            onGenerate={handleGenerate}
            onReset={handleReset}
          />
        </div>
        <div>
          <ConfigurationSection
            totalQuestions={totalQuestions}
            setTotalQuestions={setTotalQuestions}
            mcqPercentage={mcqPercentage}
            trueFalsePercentage={trueFalsePercentage}
            fillInPercentage={fillInPercentage}
            handlePercentageChange={handlePercentageChange}
          />
        </div>
      </div>

      {generatedQuestions && (
        <div className="mt-8">
          <ResultsSection generatedQuestions={generatedQuestions} />
        </div>
      )}
    </div>
  );
}
