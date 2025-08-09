// brainforge/components/3-results-section.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedResponse, Question } from "../types";
import {
  getQuestionTypeColor,
  formatQuestionType,
  shuffleArray,
} from "../lib/utils";

interface QuizQuestion extends Question {
  // We'll store the shuffled options for MCQs here
  displayOptions?: string[];
}

interface ResultsSectionProps {
  generatedQuestions: GeneratedResponse;
}

export function ResultsSection({ generatedQuestions }: ResultsSectionProps) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{
    [key: number]: string | boolean;
  }>({});
  const [fillInInputs, setFillInInputs] = useState<{ [key: number]: string }>(
    {},
  );
  const [score, setScore] = useState(0);

  // --- FIX: This entire useEffect block has been rewritten to be more robust ---
  useEffect(() => {
    // This is for debugging. If the problem persists, check your browser's console (F12).
    console.log("Received new questions from parent:", generatedQuestions);

    if (generatedQuestions && generatedQuestions.questions) {
      const processedQuestions = generatedQuestions.questions.map((q) => {
        // For Multiple Choice questions
        // We ensure `answer` is a string and `options` is an array (even if empty)
        if (q.question_type.toLowerCase() === "mcq") {
          const distractors = q.options || [];
          const allOptions = [...distractors, q.answer as string];
          return {
            ...q,
            displayOptions: shuffleArray(allOptions),
          };
        }
        // For all other question types, we just return them as is.
        // True/False options will be handled directly in the JSX for simplicity.
        return q;
      });

      setQuizQuestions(processedQuestions);
      // Reset all quiz state for the new set of questions
      setUserAnswers({});
      setFillInInputs({});
      setScore(0);
    }
  }, [generatedQuestions]);
  // --- END OF FIX ---

  const handleAnswerSubmit = (
    questionIndex: number,
    answer: string | boolean,
  ) => {
    if (userAnswers[questionIndex] !== undefined) return;

    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));

    // Case-insensitive comparison for strings
    const correctAnswer = quizQuestions[questionIndex].answer;
    if (String(answer).toLowerCase() === String(correctAnswer).toLowerCase()) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const handleFillInChange = (questionIndex: number, value: string) => {
    setFillInInputs((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const isQuizFinished =
    quizQuestions.length > 0 &&
    Object.keys(userAnswers).length === quizQuestions.length;

  return (
    <>
      <Card className="rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Quiz Time!
              <Badge variant="secondary" className="ml-2">
                {quizQuestions.length} questions
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[800px] pr-4">
            <div className="space-y-6">
              {quizQuestions.map((question, index) => {
                const isAnswered = userAnswers[index] !== undefined;
                const correctAnswer = question.answer;

                return (
                  <Card
                    key={index}
                    className="border border-gray-200 p-6 transition-shadow dark:border-gray-700"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="flex-1 text-lg leading-relaxed font-semibold text-gray-900 dark:text-gray-100">
                        {index + 1}. {question.question_statement}
                      </h3>
                      <Badge
                        className={getQuestionTypeColor(question.question_type)}
                      >
                        {formatQuestionType(question.question_type)}
                      </Badge>
                    </div>

                    {/* --- FIX: Rendering logic is now separated and more explicit --- */}

                    {/* RENDER MULTIPLE CHOICE OPTIONS */}
                    {question.question_type.toLowerCase() === "mcq" && (
                      <div className="mb-4 space-y-2">
                        {question.displayOptions?.map((option, optionIndex) => {
                          let optionStyle =
                            "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700";
                          if (isAnswered) {
                            const isSelectedOption =
                              userAnswers[index] === option;
                            const isCorrectOption = option === correctAnswer;
                            if (isCorrectOption) {
                              optionStyle =
                                "bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700 text-green-900 dark:text-green-100 font-semibold";
                            } else if (isSelectedOption && !isCorrectOption) {
                              optionStyle =
                                "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700 text-red-900 dark:text-red-100 font-semibold";
                            }
                          }
                          return (
                            <Button
                              key={optionIndex}
                              variant="outline"
                              disabled={isAnswered}
                              onClick={() => handleAnswerSubmit(index, option)}
                              className={`h-auto w-full justify-start py-3 text-left transition-colors ${optionStyle}`}
                            >
                              <span className="text-primary mr-3 font-medium">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              {option}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {/* RENDER TRUE/FALSE OPTIONS */}
                    {question.question_type.toLowerCase() === "true_false" && (
                      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[true, false].map((optionValue) => {
                          let optionStyle =
                            "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700";
                          if (isAnswered) {
                            const isSelectedOption =
                              userAnswers[index] === optionValue;
                            const isCorrectOption =
                              optionValue === correctAnswer;
                            if (isCorrectOption) {
                              optionStyle =
                                "bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700 text-green-900 dark:text-green-100 font-semibold";
                            } else if (isSelectedOption && !isCorrectOption) {
                              optionStyle =
                                "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700 text-red-900 dark:text-red-100 font-semibold";
                            }
                          }
                          return (
                            <Button
                              key={String(optionValue)}
                              variant="outline"
                              disabled={isAnswered}
                              onClick={() =>
                                handleAnswerSubmit(index, optionValue)
                              }
                              className={`h-auto py-3 text-lg transition-colors ${optionStyle}`}
                            >
                              {optionValue ? "True" : "False"}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {/* RENDER FILL IN THE BLANK */}
                    {question.question_type.toLowerCase() === "fill_in" && (
                      <div className="mb-4 flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Type your answer..."
                          value={fillInInputs[index] || ""}
                          onChange={(e) =>
                            handleFillInChange(index, e.target.value)
                          }
                          disabled={isAnswered}
                        />
                        <Button
                          onClick={() =>
                            handleAnswerSubmit(index, fillInInputs[index] || "")
                          }
                          disabled={isAnswered || !fillInInputs[index]}
                        >
                          Submit
                        </Button>
                      </div>
                    )}

                    {/* RENDER FEEDBACK MESSAGE */}
                    {isAnswered && (
                      <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${String(userAnswers[index]).toLowerCase() === String(correctAnswer).toLowerCase() ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                      >
                        {String(userAnswers[index]).toLowerCase() ===
                        String(correctAnswer).toLowerCase() ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>
                          {String(userAnswers[index]).toLowerCase() ===
                          String(correctAnswer).toLowerCase()
                            ? "Correct!"
                            : `Incorrect. The correct answer is: `}
                          {String(userAnswers[index]).toLowerCase() !==
                            String(correctAnswer).toLowerCase() && (
                            <strong>{String(correctAnswer)}</strong>
                          )}
                        </span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {isQuizFinished && (
            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() =>
                  toast.success(
                    `Quiz Complete! Your score: ${score} / ${quizQuestions.length}`,
                  )
                }
              >
                Show My Score
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
