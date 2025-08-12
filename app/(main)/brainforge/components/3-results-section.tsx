"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Trophy, Target, BookOpen } from "lucide-react"
import type { GeneratedResponse, Question } from "../types"
import { getQuestionTypeColor, formatQuestionType, shuffleArray } from "../lib/utils"

interface QuizQuestion extends Question {
  displayOptions?: string[]
}

interface ResultsSectionProps {
  generatedQuestions: GeneratedResponse
}

export function ResultsSection({ generatedQuestions }: ResultsSectionProps) {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<{
    [key: number]: string | boolean
  }>({})
  const [fillInInputs, setFillInInputs] = useState<{ [key: number]: string }>({})
  const [score, setScore] = useState(0)
  const [showScoreModal, setShowScoreModal] = useState(false)

  useEffect(() => {
    console.log("Received new questions from parent:", generatedQuestions)

    if (generatedQuestions && generatedQuestions.questions) {
      console.log(
        "Question types found:",
        generatedQuestions.questions.map((q) => q.question_type),
      )
      const fillInQuestions = generatedQuestions.questions.filter((q) => q.question_type.toLowerCase() === "fill_in")
      console.log("Fill-in questions found:", fillInQuestions.length)

      const processedQuestions = generatedQuestions.questions.map((q) => {
        if (q.question_type.toLowerCase() === "mcq") {
          const distractors = q.options || []
          const allOptions = [...distractors, q.answer as string]
          return {
            ...q,
            displayOptions: shuffleArray(allOptions),
          }
        }
        return q
      })

      setQuizQuestions(processedQuestions)
      setUserAnswers({})
      setFillInInputs({})
      setScore(0)
    }
  }, [generatedQuestions])

  const handleAnswerSubmit = (questionIndex: number, answer: string | boolean) => {
    if (userAnswers[questionIndex] !== undefined) return

    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }))

    const correctAnswer = quizQuestions[questionIndex].answer
    let isCorrect = false

    if (typeof answer === "boolean" && typeof correctAnswer === "boolean") {
      isCorrect = answer === correctAnswer
    } else if (typeof answer === "boolean" && typeof correctAnswer === "string") {
      const normalizedCorrect = correctAnswer.toLowerCase() === "true"
      isCorrect = answer === normalizedCorrect
    } else {
      isCorrect = String(answer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
    }

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1)
    }
  }

  const handleFillInChange = (questionIndex: number, value: string) => {
    setFillInInputs((prev) => ({ ...prev, [questionIndex]: value }))
  }

  const getScoreBreakdown = () => {
    const correctAnswers: Array<{ question: string; userAnswer: string; type: string; index: number }> = []
    const wrongAnswers: Array<{
      question: string
      userAnswer: string
      correctAnswer: string
      type: string
      index: number
    }> = []

    quizQuestions.forEach((question, index) => {
      if (userAnswers[index] === undefined) return

      const userAnswer = userAnswers[index]
      const correctAnswer = question.answer
      let isCorrect = false

      if (typeof userAnswer === "boolean") {
        if (typeof correctAnswer === "boolean") {
          isCorrect = userAnswer === correctAnswer
        } else {
          const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
          isCorrect = userAnswer === normalizedCorrect
        }
      } else {
        isCorrect = String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
      }

      const answerData = {
        question: question.question_statement,
        userAnswer: String(userAnswer),
        type: question.question_type,
        index: index + 1,
      }

      if (isCorrect) {
        correctAnswers.push(answerData)
      } else {
        wrongAnswers.push({
          ...answerData,
          correctAnswer: String(correctAnswer),
        })
      }
    })

    return { correctAnswers, wrongAnswers }
  }

  const isQuizFinished = quizQuestions.length > 0 && Object.keys(userAnswers).length === quizQuestions.length

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90)
      return { message: "Outstanding! You're a quiz master!", color: "text-green-600", icon: Trophy }
    if (percentage >= 80) return { message: "Excellent work! Keep it up!", color: "text-blue-600", icon: Target }
    if (percentage >= 70)
      return { message: "Good job! You're on the right track!", color: "text-yellow-600", icon: BookOpen }
    if (percentage >= 60) return { message: "Not bad! Room for improvement!", color: "text-orange-600", icon: Target }
    return { message: "Keep practicing! You'll get better!", color: "text-red-600", icon: BookOpen }
  }

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
                const isAnswered = userAnswers[index] !== undefined
                const correctAnswer = question.answer

                return (
                  <Card key={index} className="border border-gray-200 p-6 transition-shadow dark:border-gray-700">
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="flex-1 text-lg leading-relaxed font-semibold text-gray-900 dark:text-gray-100">
                        {index + 1}. {question.question_statement}
                      </h3>
                      <Badge className={getQuestionTypeColor(question.question_type)}>
                        {formatQuestionType(question.question_type)}
                      </Badge>
                    </div>

                    {question.question_type.toLowerCase() === "mcq" && (
                      <div className="mb-4 space-y-2">
                        {question.displayOptions?.map((option, optionIndex) => {
                          let optionStyle =
                            "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          if (isAnswered) {
                            const isSelectedOption = userAnswers[index] === option
                            const isCorrectOption = option === correctAnswer
                            if (isCorrectOption) {
                              optionStyle =
                                "bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700 text-green-900 dark:text-green-100 font-semibold"
                            } else if (isSelectedOption && !isCorrectOption) {
                              optionStyle =
                                "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700 text-red-900 dark:text-red-100 font-semibold"
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
                          )
                        })}
                      </div>
                    )}

                    {question.question_type.toLowerCase() === "true_false" && (
                      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[true, false].map((optionValue) => {
                          let optionStyle =
                            "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                          if (isAnswered) {
                            const isSelectedOption = userAnswers[index] === optionValue
                            let isCorrectOption = false
                            if (typeof correctAnswer === "boolean") {
                              isCorrectOption = optionValue === correctAnswer
                            } else {
                              const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                              isCorrectOption = optionValue === normalizedCorrect
                            }

                            if (isCorrectOption) {
                              optionStyle =
                                "bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700 text-green-900 dark:text-green-100 font-semibold"
                            } else if (isSelectedOption && !isCorrectOption) {
                              optionStyle =
                                "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700 text-red-900 dark:text-red-100 font-semibold"
                            }
                          }
                          return (
                            <Button
                              key={String(optionValue)}
                              variant="outline"
                              disabled={isAnswered}
                              onClick={() => handleAnswerSubmit(index, optionValue)}
                              className={`h-auto py-3 text-lg transition-colors ${optionStyle}`}
                            >
                              {optionValue ? "True" : "False"}
                            </Button>
                          )
                        })}
                      </div>
                    )}

                    {question.question_type.toLowerCase() === "fill_in" && (
                      <div className="mb-4 flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Type your answer..."
                          value={fillInInputs[index] || ""}
                          onChange={(e) => {
                            console.log(`Fill-in input ${index} changed to:`, e.target.value)
                            handleFillInChange(index, e.target.value)
                          }}
                          disabled={isAnswered}
                          onFocus={() => console.log(`Fill-in input ${index} focused, disabled: ${isAnswered}`)}
                          onKeyDown={(e) => console.log(`Fill-in input ${index} key pressed:`, e.key)}
                          className={
                            isAnswered
                              ? String(fillInInputs[index] || "")
                                  .toLowerCase()
                                  .trim() === String(correctAnswer).toLowerCase().trim()
                                ? "bg-green-50 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-700 dark:text-green-100"
                                : "bg-red-50 border-red-300 text-red-900 dark:bg-red-900/20 dark:border-red-700 dark:text-red-100"
                              : "focus:border-blue-500 focus:ring-blue-500"
                          }
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <Button
                          onClick={() => handleAnswerSubmit(index, fillInInputs[index] || "")}
                          disabled={isAnswered || !fillInInputs[index]?.trim()}
                          variant={isAnswered ? "secondary" : "default"}
                        >
                          {isAnswered ? "Submitted" : "Submit"}
                        </Button>
                      </div>
                    )}

                    {isAnswered && (
                      <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${(() => {
                          let isCorrect = false
                          if (typeof userAnswers[index] === "boolean") {
                            if (typeof correctAnswer === "boolean") {
                              isCorrect = userAnswers[index] === correctAnswer
                            } else {
                              const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                              isCorrect = userAnswers[index] === normalizedCorrect
                            }
                          } else {
                            isCorrect =
                              String(userAnswers[index]).toLowerCase().trim() ===
                              String(correctAnswer).toLowerCase().trim()
                          }
                          return isCorrect
                            ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-700"
                        })()}`}
                      >
                        {(() => {
                          let isCorrect = false
                          if (typeof userAnswers[index] === "boolean") {
                            if (typeof correctAnswer === "boolean") {
                              isCorrect = userAnswers[index] === correctAnswer
                            } else {
                              const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                              isCorrect = userAnswers[index] === normalizedCorrect
                            }
                          } else {
                            isCorrect =
                              String(userAnswers[index]).toLowerCase().trim() ===
                              String(correctAnswer).toLowerCase().trim()
                          }
                          return isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                        })()}
                        <span>
                          {(() => {
                            let isCorrect = false
                            if (typeof userAnswers[index] === "boolean") {
                              if (typeof correctAnswer === "boolean") {
                                isCorrect = userAnswers[index] === correctAnswer
                              } else {
                                const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                                isCorrect = userAnswers[index] === normalizedCorrect
                              }
                            } else {
                              isCorrect =
                                String(userAnswers[index]).toLowerCase().trim() ===
                                String(correctAnswer).toLowerCase().trim()
                            }
                            return isCorrect ? "Correct!" : `Incorrect. The correct answer is: `
                          })()}
                          {(() => {
                            let isCorrect = false
                            if (typeof userAnswers[index] === "boolean") {
                              if (typeof correctAnswer === "boolean") {
                                isCorrect = userAnswers[index] === correctAnswer
                              } else {
                                const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                                isCorrect = userAnswers[index] === normalizedCorrect
                              }
                            } else {
                              isCorrect =
                                String(userAnswers[index]).toLowerCase().trim() ===
                                String(correctAnswer).toLowerCase().trim()
                            }
                            return !isCorrect && <strong>{String(correctAnswer)}</strong>
                          })()}
                        </span>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          {isQuizFinished && (
            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowScoreModal(true)}
              >
                Show My Score
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Quiz Results
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] pr-4">
            <div className="space-y-8">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold shadow-lg">
                  {Math.round((score / quizQuestions.length) * 100)}%
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {score} out of {quizQuestions.length} correct
                  </h3>
                  <div
                    className={`flex items-center justify-center gap-2 ${getPerformanceMessage((score / quizQuestions.length) * 100).color}`}
                  >
                    {(() => {
                      const { icon: Icon } = getPerformanceMessage((score / quizQuestions.length) * 100)
                      return <Icon className="h-6 w-6" />
                    })()}
                    <p className="text-xl font-medium">
                      {getPerformanceMessage((score / quizQuestions.length) * 100).message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
                  Performance by Question Type
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {["mcq", "true_false", "fill_in"].map((type) => {
                    const typeQuestions = quizQuestions.filter((q) => q.question_type.toLowerCase() === type)
                    if (typeQuestions.length === 0) return null

                    const typeScore = typeQuestions.reduce((acc, q, idx) => {
                      const originalIndex = quizQuestions.findIndex((oq) => oq === q)
                      const userAnswer = userAnswers[originalIndex]
                      const correctAnswer = q.answer
                      let isCorrect = false

                      if (typeof userAnswer === "boolean") {
                        if (typeof correctAnswer === "boolean") {
                          isCorrect = userAnswer === correctAnswer
                        } else {
                          const normalizedCorrect = String(correctAnswer).toLowerCase() === "true"
                          isCorrect = userAnswer === normalizedCorrect
                        }
                      } else {
                        isCorrect =
                          String(userAnswer).toLowerCase().trim() === String(correctAnswer).toLowerCase().trim()
                      }

                      return acc + (isCorrect ? 1 : 0)
                    }, 0)

                    return (
                      <Card key={type} className="p-6 text-center border-2 hover:shadow-md transition-shadow">
                        <Badge className={`${getQuestionTypeColor(type)} mb-3`} variant="secondary">
                          {formatQuestionType(type)}
                        </Badge>
                        <p className="text-3xl font-bold mb-2">
                          {typeScore}/{typeQuestions.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round((typeScore / typeQuestions.length) * 100)}% accuracy
                        </p>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
                  Detailed Answer Review
                </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="border-2 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-4 bg-green-50 dark:bg-green-900/20">
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="h-5 w-5" />
                        Correct Answers ({getScoreBreakdown().correctAnswers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ScrollArea className="h-64">
                        <div className="space-y-4">
                          {getScoreBreakdown().correctAnswers.map((answer, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200 leading-relaxed">
                                  <span className="font-bold text-green-600 dark:text-green-400">Q{answer.index}:</span>{" "}
                                  {answer.question.length > 80
                                    ? `${answer.question.substring(0, 80)}...`
                                    : answer.question}
                                </p>
                                <Badge className={`${getQuestionTypeColor(answer.type)} text-xs`} variant="outline">
                                  {formatQuestionType(answer.type)}
                                </Badge>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Your answer: <strong>{answer.userAnswer}</strong>
                              </p>
                            </div>
                          ))}
                          {getScoreBreakdown().correctAnswers.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">No correct answers this time</p>
                              <p className="text-xs text-gray-400 mt-1">Keep practicing to improve!</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 dark:border-red-800">
                    <CardHeader className="pb-4 bg-red-50 dark:bg-red-900/20">
                      <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <XCircle className="h-5 w-5" />
                        Incorrect Answers ({getScoreBreakdown().wrongAnswers.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ScrollArea className="h-64">
                        <div className="space-y-4">
                          {getScoreBreakdown().wrongAnswers.map((answer, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200 leading-relaxed">
                                  <span className="font-bold text-red-600 dark:text-red-400">Q{answer.index}:</span>{" "}
                                  {answer.question.length > 80
                                    ? `${answer.question.substring(0, 80)}...`
                                    : answer.question}
                                </p>
                                <Badge className={getQuestionTypeColor(answer.type)} variant="outline" size="sm">
                                  {formatQuestionType(answer.type)}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs text-red-600 dark:text-red-400">
                                  ✗ Your answer:{" "}
                                  <strong className="bg-red-100 dark:bg-red-900/40 px-1 rounded">
                                    {answer.userAnswer}
                                  </strong>
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  ✓ Correct answer:{" "}
                                  <strong className="bg-green-100 dark:bg-green-900/40 px-1 rounded">
                                    {answer.correctAnswer}
                                  </strong>
                                </p>
                              </div>
                            </div>
                          ))}
                          {getScoreBreakdown().wrongAnswers.length === 0 && (
                            <div className="text-center py-8">
                              <p className="text-sm text-green-600 font-medium">Perfect score! 🎉</p>
                              <p className="text-xs text-gray-500 mt-1">You got every question right!</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
