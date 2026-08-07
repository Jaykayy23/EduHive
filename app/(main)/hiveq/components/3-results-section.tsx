"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  FileText,
  PencilLine,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { GeneratedResponse, Question } from "../types";

interface QuizQuestion extends Question {
  displayOptions?: string[];
}

interface ResultsSectionProps {
  generatedQuestions: GeneratedResponse;
  onEditSetup: () => void;
}

const formatQuestionType = (type: string) => {
  const labels = {
    mcq: "Multiple choice",
    true_false: "True or false",
    fill_in: "Fill in the blank",
  };
  return labels[type.toLowerCase() as keyof typeof labels] ?? type;
};

const shuffleArray = <T,>(items: T[]) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }
  return shuffled;
};

const getMultipleChoiceOptions = (question: Question) => {
  const options = (question.options ?? [])
    .map((option) => option.trim())
    .filter(Boolean);
  const answer = String(question.answer).trim();
  if (
    !options.some((option) => option.toLowerCase() === answer.toLowerCase())
  ) {
    options.push(answer);
  }
  return [...new Set(options)];
};

const isAnswerCorrect = (
  question: Question,
  answer: string | boolean | undefined,
) => {
  if (answer === undefined) return false;
  if (typeof answer === "boolean") {
    return answer === (String(question.answer).toLowerCase() === "true");
  }
  return (
    String(answer).toLowerCase().trim() ===
    String(question.answer).toLowerCase().trim()
  );
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export function ResultsSection({
  generatedQuestions,
  onEditSetup,
}: ResultsSectionProps) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<number, string | boolean>
  >({});
  const [fillInInputs, setFillInInputs] = useState<Record<number, string>>({});
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    const preparedQuestions = generatedQuestions.questions.map((question) =>
      question.question_type.toLowerCase() === "mcq"
        ? {
            ...question,
            displayOptions: shuffleArray(getMultipleChoiceOptions(question)),
          }
        : question,
    );

    setQuizQuestions(preparedQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFillInInputs({});
    setShowScoreModal(false);
  }, [generatedQuestions]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isQuizFinished =
    quizQuestions.length > 0 && answeredCount === quizQuestions.length;

  const score = useMemo(
    () =>
      quizQuestions.reduce(
        (total, question, index) =>
          total + (isAnswerCorrect(question, userAnswers[index]) ? 1 : 0),
        0,
      ),
    [quizQuestions, userAnswers],
  );

  const answerQuestion = (answer: string | boolean) => {
    if (userAnswers[currentQuestionIndex] !== undefined) return;
    setUserAnswers((answers) => ({
      ...answers,
      [currentQuestionIndex]: answer,
    }));
  };

  const retryQuiz = () => {
    setQuizQuestions((questions) =>
      questions.map((question) =>
        question.question_type.toLowerCase() === "mcq"
          ? {
              ...question,
              displayOptions: shuffleArray(
                question.displayOptions ?? getMultipleChoiceOptions(question),
              ),
            }
          : question,
      ),
    );
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFillInInputs({});
    setShowScoreModal(false);
  };

  const formatQuestionsAsText = () => {
    const lines = [
      "HIVEQ QUIZ EXPORT",
      `Generated on: ${new Date().toLocaleString()}`,
      `Total questions: ${generatedQuestions.questions.length}`,
      "",
    ];

    generatedQuestions.questions.forEach((question, index) => {
      lines.push(
        `Question ${index + 1}: ${formatQuestionType(question.question_type)}`,
        question.question_statement,
      );

      if (question.question_type.toLowerCase() === "mcq") {
        getMultipleChoiceOptions(question).forEach((option, optionIndex) => {
          lines.push(`${String.fromCharCode(65 + optionIndex)}. ${option}`);
        });
      } else if (question.question_type.toLowerCase() === "true_false") {
        lines.push("A. True", "B. False");
      } else {
        lines.push("Answer: ___________________");
      }

      lines.push(`Correct answer: ${String(question.answer)}`, "");
    });

    return lines.join("\n");
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    downloadBlob(
      new Blob([formatQuestionsAsText()], { type: "text/plain;charset=utf-8" }),
      `hiveq-quiz-${Date.now()}.txt`,
    );
    toast.success("Quiz exported as TXT.");
  };

  const exportAsJson = () => {
    downloadBlob(
      new Blob(
        [
          JSON.stringify(
            {
              generated_at: new Date().toISOString(),
              source_text_preview: generatedQuestions.source_text.substring(
                0,
                200,
              ),
              total_questions: generatedQuestions.questions.length,
              questions: generatedQuestions.questions,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
      `hiveq-quiz-${Date.now()}.json`,
    );
    toast.success("Quiz exported as JSON.");
  };

  const exportAsPdf = () => {
    const questions = generatedQuestions.questions
      .map((question, index) => {
        const options =
          question.question_type.toLowerCase() === "mcq"
            ? getMultipleChoiceOptions(question)
                .map(
                  (option, optionIndex) =>
                    `<li>${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}</li>`,
                )
                .join("")
            : question.question_type.toLowerCase() === "true_false"
              ? "<li>A. True</li><li>B. False</li>"
              : "<li>Answer: ___________________</li>";

        return `<section><h2>Question ${index + 1}</h2><p>${escapeHtml(question.question_statement)}</p><ol>${options}</ol><p><strong>Correct answer:</strong> ${escapeHtml(String(question.answer))}</p></section>`;
      })
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Allow pop-ups to open the PDF print dialog.");
      return;
    }

    printWindow.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>HiveQ Quiz</title><style>body{font-family:Arial,sans-serif;line-height:1.55;margin:40px;color:#172033}h1{font-size:28px}h2{font-size:18px;margin-bottom:8px}section{page-break-inside:avoid;margin:28px 0;padding-bottom:22px;border-bottom:1px solid #dfe4ec}ol{padding-left:24px}li{margin:6px 0}</style></head><body><h1>HiveQ Quiz</h1><p>${generatedQuestions.questions.length} questions</p>${questions}</body></html>`,
    );
    printWindow.document.close();
    printWindow.onload = () => printWindow.print();
    toast.success("PDF print dialog opened.");
  };

  if (!currentQuestion) return null;

  const currentAnswer = userAnswers[currentQuestionIndex];
  const currentIsAnswered = currentAnswer !== undefined;
  const currentIsCorrect = isAnswerCorrect(currentQuestion, currentAnswer);
  const percentage = Math.round((score / quizQuestions.length) * 100);

  return (
    <>
      <Card className="min-w-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle>Your quiz</CardTitle>
          <CardDescription>
            {answeredCount} of {quizQuestions.length} answered
          </CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download data-icon="inline-start" aria-hidden="true" />
                  Export
                  <ChevronDown data-icon="inline-end" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={exportAsText}>
                    <FileText aria-hidden="true" />
                    Export as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsPdf}>
                    <FileText aria-hidden="true" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsJson}>
                    <FileJson aria-hidden="true" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <Card className="min-w-0 gap-5 shadow-none">
              <CardHeader className="px-4 sm:px-6">
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>
                    Question {currentQuestionIndex + 1} of{" "}
                    {quizQuestions.length}
                  </span>
                  <Badge variant="outline">
                    {formatQuestionType(currentQuestion.question_type)}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-xl leading-snug break-words sm:text-2xl">
                  {currentQuestion.question_statement}
                </CardTitle>
                {currentQuestion.context && (
                  <CardDescription className="mt-2 leading-relaxed">
                    {currentQuestion.context}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="min-w-0 px-4 sm:px-6">
                {currentQuestion.question_type.toLowerCase() === "mcq" && (
                  <div
                    className="flex min-w-0 flex-col gap-3"
                    role="radiogroup"
                    aria-label="Answer options"
                  >
                    {currentQuestion.displayOptions?.map(
                      (option, optionIndex) => {
                        const isSelected = currentAnswer === option;
                        const isCorrectOption =
                          currentIsAnswered &&
                          option.toLowerCase().trim() ===
                            String(currentQuestion.answer).toLowerCase().trim();

                        return (
                          <Button
                            key={`${option}-${optionIndex}`}
                            type="button"
                            variant="outline"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={currentIsAnswered}
                            onClick={() => answerQuestion(option)}
                            className={cn(
                              "h-auto min-h-14 w-full max-w-full min-w-0 items-start justify-start gap-3 overflow-hidden px-3 py-3 text-left leading-relaxed whitespace-normal disabled:opacity-100 sm:px-4",
                              isCorrectOption && "border-primary bg-primary/10",
                              currentIsAnswered &&
                                isSelected &&
                                !isCorrectOption &&
                                "border-destructive bg-destructive/10 text-destructive",
                            )}
                          >
                            <span className="bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="min-w-0 flex-1 text-left [overflow-wrap:anywhere] break-words whitespace-normal">
                              {option}
                            </span>
                          </Button>
                        );
                      },
                    )}
                  </div>
                )}

                {currentQuestion.question_type.toLowerCase() ===
                  "true_false" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[true, false].map((option) => {
                      const optionIsCorrect =
                        currentIsAnswered &&
                        option ===
                          (String(currentQuestion.answer).toLowerCase() ===
                            "true");
                      const optionIsSelected = currentAnswer === option;

                      return (
                        <Button
                          key={String(option)}
                          type="button"
                          variant="outline"
                          size="lg"
                          disabled={currentIsAnswered}
                          onClick={() => answerQuestion(option)}
                          className={cn(
                            "h-auto min-h-14 disabled:opacity-100",
                            optionIsCorrect && "border-primary bg-primary/10",
                            currentIsAnswered &&
                              optionIsSelected &&
                              !optionIsCorrect &&
                              "border-destructive bg-destructive/10 text-destructive",
                          )}
                        >
                          {option ? "True" : "False"}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.question_type.toLowerCase() === "fill_in" && (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      value={fillInInputs[currentQuestionIndex] ?? ""}
                      onChange={(event) =>
                        setFillInInputs((inputs) => ({
                          ...inputs,
                          [currentQuestionIndex]: event.target.value,
                        }))
                      }
                      placeholder="Type your answer"
                      disabled={currentIsAnswered}
                      aria-label="Your answer"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        answerQuestion(fillInInputs[currentQuestionIndex] ?? "")
                      }
                      disabled={
                        currentIsAnswered ||
                        !fillInInputs[currentQuestionIndex]?.trim()
                      }
                    >
                      Submit answer
                    </Button>
                  </div>
                )}

                {currentIsAnswered && (
                  <Alert
                    variant={currentIsCorrect ? "default" : "destructive"}
                    className={cn(
                      "mt-4",
                      currentIsCorrect && "border-primary/30 bg-primary/5",
                    )}
                  >
                    {currentIsCorrect ? (
                      <CheckCircle2
                        className="text-primary"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle aria-hidden="true" />
                    )}
                    <AlertTitle>
                      {currentIsCorrect ? "Correct" : "Review this answer"}
                    </AlertTitle>
                    <AlertDescription>
                      {currentIsCorrect
                        ? "Good work. This answer matches the source material."
                        : `The correct answer is ${String(currentQuestion.answer)}.`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex-col-reverse justify-between gap-3 border-t px-4 sm:flex-row sm:px-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((index) => Math.max(0, index - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                  Previous
                </Button>

                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((index) =>
                        Math.min(quizQuestions.length - 1, index + 1),
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    Next question
                    <ArrowRight data-icon="inline-end" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowScoreModal(true)}
                    disabled={!isQuizFinished}
                    className="w-full sm:w-auto"
                  >
                    <Trophy data-icon="inline-start" aria-hidden="true" />
                    View results
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card className="h-fit gap-4 shadow-none lg:sticky lg:top-20">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base">Questions</CardTitle>
                <CardDescription>
                  Choose any question to review it.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
                  {quizQuestions.map((question, index) => {
                    const isAnswered = userAnswers[index] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <Button
                        key={`${question.question_statement}-${index}`}
                        type="button"
                        variant={
                          isCurrent
                            ? "default"
                            : isAnswered
                              ? "secondary"
                              : "outline"
                        }
                        size="icon-sm"
                        onClick={() => setCurrentQuestionIndex(index)}
                        aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ""}`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 border-t px-4 sm:px-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onEditSetup}
                  className="w-full"
                >
                  <PencilLine data-icon="inline-start" aria-hidden="true" />
                  Edit setup
                </Button>
                {isQuizFinished && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScoreModal(true)}
                    className="w-full"
                  >
                    <Trophy data-icon="inline-start" aria-hidden="true" />
                    View results
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-h-[92svh] max-w-3xl overflow-hidden p-0">
          <DialogHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Trophy className="text-primary size-5" aria-hidden="true" />
              Quiz results
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[78svh] px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-6 pt-4">
              <section className="bg-primary/5 flex flex-col gap-3 rounded-xl border p-5 text-center">
                <p className="text-primary text-4xl font-semibold tabular-nums">
                  {percentage}%
                </p>
                <div>
                  <h3 className="text-lg font-semibold">
                    {score} of {quizQuestions.length} correct
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {percentage >= 80
                      ? "Strong work. You understand this material well."
                      : percentage >= 60
                        ? "Good progress. Review the missed answers and try again."
                        : "Keep practicing. A second attempt will help reinforce the material."}
                  </p>
                </div>
              </section>

              <section
                aria-labelledby="hiveq-answer-review"
                className="flex flex-col gap-4"
              >
                <h3 id="hiveq-answer-review" className="font-semibold">
                  Answer review
                </h3>
                <div className="flex flex-col gap-4">
                  {quizQuestions.map((question, index) => {
                    const correct = isAnswerCorrect(
                      question,
                      userAnswers[index],
                    );
                    return (
                      <div key={`${question.question_statement}-review`}>
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="min-w-0 text-sm leading-relaxed font-medium break-words">
                                {question.question_statement}
                              </p>
                              <Badge
                                variant={correct ? "secondary" : "destructive"}
                              >
                                {correct ? "Correct" : "Review"}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-2 text-xs leading-relaxed break-words">
                              Your answer: {String(userAnswers[index])}
                            </p>
                            {!correct && (
                              <p className="text-foreground mt-1 text-xs leading-relaxed break-words">
                                Correct answer: {String(question.answer)}
                              </p>
                            )}
                          </div>
                        </div>
                        {index < quizQuestions.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={retryQuiz}>
                  <RotateCcw data-icon="inline-start" aria-hidden="true" />
                  Retry quiz
                </Button>
                <Button type="button" onClick={() => setShowScoreModal(false)}>
                  Review questions
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
