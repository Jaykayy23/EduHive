"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  BookOpen,
  Download,
  ChevronDown,
  FileText,
  File,
  Award,
  Star,
  Zap,
} from "lucide-react"

// Mock types - replace with your actual imports
interface Question {
  question_statement: string
  question_type: string
  answer: string | boolean
  options?: string[]
}

interface GeneratedResponse {
  questions: Question[]
  source_text: string
}

interface QuizQuestion extends Question {
  displayOptions?: string[]
}

interface ResultsSectionProps {
  generatedQuestions: GeneratedResponse
}

// Mock utility functions - replace with your actual imports
const getQuestionTypeColor = (type: string) => {
  const colors = {
    mcq: "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:bg-blue-400/20 dark:text-blue-300 dark:border-blue-400/30",
    true_false:
      "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/20 dark:text-emerald-300 dark:border-emerald-400/30",
    fill_in:
      "bg-amber-500/20 text-amber-700 border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-300 dark:border-amber-400/30",
  }
  return colors[type.toLowerCase() as keyof typeof colors] || "bg-muted text-muted-foreground"
}

const formatQuestionType = (type: string) => {
  const formats = {
    mcq: "Multiple Choice",
    true_false: "True/False",
    fill_in: "Fill in the Blank",
  }
  return formats[type.toLowerCase() as keyof typeof formats] || type
}

const shuffleArray = (array: any[]) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const toast = {
  success: (message: string) => console.log("Success:", message),
  error: (message: string) => console.log("Error:", message),
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

  const formatQuestionsAsText = () => {
    const timestamp = new Date().toLocaleString()
    let textContent = `BRAINFORGE QUIZ EXPORT\n`
    textContent += `Generated on: ${timestamp}\n`
    textContent += `Total Questions: ${generatedQuestions.questions.length}\n`
    textContent += `Source Text Preview: ${generatedQuestions.source_text.substring(0, 200)}...\n`
    textContent += `\n${"=".repeat(80)}\n\n`

    generatedQuestions.questions.forEach((question, index) => {
      textContent += `Question ${index + 1}: [${formatQuestionType(question.question_type)}]\n`
      textContent += `${question.question_statement}\n\n`

      if (question.question_type.toLowerCase() === "mcq" && question.options) {
        const allOptions = [...question.options, question.answer as string]
        const shuffledOptions = shuffleArray(allOptions)

        shuffledOptions.forEach((option, optIndex) => {
          textContent += `  ${String.fromCharCode(65 + optIndex)}. ${option}\n`
        })
        textContent += `\n`
      } else if (question.question_type.toLowerCase() === "true_false") {
        textContent += `  A. True\n`
        textContent += `  B. False\n\n`
      } else if (question.question_type.toLowerCase() === "fill_in") {
        textContent += `  Answer: ___________________\n\n`
      }

      textContent += `Correct Answer: ${question.answer}\n`
      textContent += `${"-".repeat(50)}\n\n`
    })

    return textContent
  }

  const exportAsText = () => {
    const textContent = formatQuestionsAsText()
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brainforge-quiz-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Quiz exported as TXT successfully!")
  }

  const exportAsPDF = () => {
    const textContent = formatQuestionsAsText()

    // Create a simple HTML structure for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>BrainForge Quiz Export</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 40px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .question { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .question-title { 
            font-weight: bold; 
            color: #2563eb;
            margin-bottom: 10px;
          }
          .question-type {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            display: inline-block;
            margin-left: 10px;
          }
          .options { 
            margin: 15px 0; 
            padding-left: 20px;
          }
          .answer { 
            background: #f0f9ff; 
            padding: 8px; 
            border-left: 4px solid #2563eb;
            margin-top: 10px;
          }
          .divider {
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BrainForge Quiz Export</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Questions: ${generatedQuestions.questions.length}</p>
          <p><strong>Source Text Preview:</strong> ${generatedQuestions.source_text.substring(0, 200)}...</p>
        </div>
        
        ${generatedQuestions.questions
          .map((question, index) => {
            let optionsHtml = ""

            if (question.question_type.toLowerCase() === "mcq" && question.options) {
              const allOptions = [...question.options, question.answer as string]
              const shuffledOptions = shuffleArray(allOptions)
              optionsHtml = `
              <div class="options">
                ${shuffledOptions
                  .map((option, optIndex) => `<div>${String.fromCharCode(65 + optIndex)}. ${option}</div>`)
                  .join("")}
              </div>
            `
            } else if (question.question_type.toLowerCase() === "true_false") {
              optionsHtml = `
              <div class="options">
                <div>A. True</div>
                <div>B. False</div>
              </div>
            `
            } else if (question.question_type.toLowerCase() === "fill_in") {
              optionsHtml = `
              <div class="options">
                Answer: ___________________
              </div>
            `
            }

            return `
            <div class="question">
              <div class="question-title">
                Question ${index + 1}
                <span class="question-type">[${formatQuestionType(question.question_type)}]</span>
              </div>
              <div>${question.question_statement}</div>
              ${optionsHtml}
              <div class="answer">
                <strong>Correct Answer:</strong> ${question.answer}
              </div>
            </div>
            ${index < generatedQuestions.questions.length - 1 ? '<div class="divider"></div>' : ""}
          `
          })
          .join("")}
        
      </body>
      </html>
    `

    // Create a new window for printing to PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Note: The window will close automatically after printing or canceling
        }, 500)
      }

      toast.success("PDF export dialog opened! Use your browser's print dialog to save as PDF.")
    } else {
      toast.error("Unable to open print dialog. Please check if pop-ups are blocked.")
    }
  }

  const exportAsJSON = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      source_text_preview: generatedQuestions.source_text.substring(0, 200) + "...",
      total_questions: quizQuestions.length,
      questions: generatedQuestions.questions, // Export original non-shuffled questions
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brainforge-quiz-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Quiz exported as JSON successfully!")
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
      return {
        message: "Outstanding! You're a quiz master!",
        color: "text-emerald-600 dark:text-emerald-400",
        icon: Trophy,
      }
    if (percentage >= 80)
      return { message: "Excellent work! Keep it up!", color: "text-blue-600 dark:text-blue-400", icon: Award }
    if (percentage >= 70)
      return {
        message: "Good job! You're on the right track!",
        color: "text-amber-600 dark:text-amber-400",
        icon: Star,
      }
    if (percentage >= 60)
      return { message: "Not bad! Room for improvement!", color: "text-orange-600 dark:text-orange-400", icon: Target }
    return { message: "Keep practicing! You'll get better!", color: "text-red-600 dark:text-red-400", icon: BookOpen }
  }

  return (
    <>
      <Card className="border border-border bg-card shadow-lg">
        <CardHeader className="space-y-6 p-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-card-foreground">Interactive Quiz</CardTitle>
                <p className="text-muted-foreground mt-1">Test your knowledge and track your progress</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold">
                {quizQuestions.length} Questions
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export Quiz
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={exportAsText} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Export as TXT
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsPDF} className="gap-2">
                    <File className="h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <div className="space-y-8">
            {quizQuestions.map((question, index) => {
              const isAnswered = userAnswers[index] !== undefined
              const correctAnswer = question.answer

              return (
                <Card key={index} className="border border-border p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          className={`${getQuestionTypeColor(question.question_type)} px-3 py-1 text-xs font-medium`}
                        >
                          {formatQuestionType(question.question_type)}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold leading-relaxed text-card-foreground break-words">
                        {question.question_statement}
                      </h3>
                    </div>
                  </div>

                  {/* ... existing question type handling code ... */}

                  {question.question_type.toLowerCase() === "mcq" && (
                    <div className="space-y-3">
                      {question.displayOptions?.map((option, optionIndex) => {
                        let optionClasses =
                          "w-full justify-start gap-3 p-4 h-auto text-left border border-border hover:bg-muted/50"

                        if (isAnswered) {
                          const isSelectedOption = userAnswers[index] === option
                          const isCorrectOption = option === correctAnswer

                          if (isCorrectOption) {
                            optionClasses =
                              "w-full justify-start gap-3 p-4 h-auto text-left border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                          } else if (isSelectedOption && !isCorrectOption) {
                            optionClasses =
                              "w-full justify-start gap-3 p-4 h-auto text-left border-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                          }
                        }

                        return (
                          <Button
                            key={optionIndex}
                            variant="outline"
                            disabled={isAnswered}
                            onClick={() => handleAnswerSubmit(index, option)}
                            className={optionClasses}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span className="flex-1 text-left break-words">{option}</span>
                          </Button>
                        )
                      })}
                    </div>
                  )}

                  {question.question_type.toLowerCase() === "true_false" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[true, false].map((optionValue) => {
                        let optionClasses = "h-auto py-4 text-lg font-medium border border-border hover:bg-muted/50"

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
                            optionClasses =
                              "h-auto py-4 text-lg font-semibold border-2 border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                          } else if (isSelectedOption && !isCorrectOption) {
                            optionClasses =
                              "h-auto py-4 text-lg font-semibold border-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                          }
                        }

                        return (
                          <Button
                            key={String(optionValue)}
                            variant="outline"
                            disabled={isAnswered}
                            onClick={() => handleAnswerSubmit(index, optionValue)}
                            className={optionClasses}
                          >
                            {optionValue ? "True" : "False"}
                          </Button>
                        )
                      })}
                    </div>
                  )}

                  {question.question_type.toLowerCase() === "fill_in" && (
                    <div className="flex items-center gap-3">
                      <Input
                        type="text"
                        placeholder="Type your answer here..."
                        value={fillInInputs[index] || ""}
                        onChange={(e) => handleFillInChange(index, e.target.value)}
                        disabled={isAnswered}
                        className={`flex-1 h-12 px-4 text-base ${
                          isAnswered
                            ? String(fillInInputs[index] || "")
                                .toLowerCase()
                                .trim() === String(correctAnswer).toLowerCase().trim()
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
                              : "border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                            : ""
                        }`}
                      />
                      <Button
                        onClick={() => handleAnswerSubmit(index, fillInInputs[index] || "")}
                        disabled={isAnswered || !fillInInputs[index]?.trim()}
                        className="px-6 h-12"
                      >
                        {isAnswered ? "Submitted" : "Submit"}
                      </Button>
                    </div>
                  )}

                  {isAnswered && (
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium ${(() => {
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
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-700"
                          : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-700"
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
                        return isCorrect ? (
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 flex-shrink-0" />
                        )
                      })()}
                      <span className="flex-1 break-words">
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
                          if (isCorrect) {
                            return "Perfect! You got it right."
                          } else {
                            return (
                              <>
                                Incorrect. The correct answer is:{" "}
                                <span className="font-bold break-words">{String(correctAnswer)}</span>
                              </>
                            )
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {isQuizFinished && (
            <div className="mt-8 text-center">
              <Button size="lg" onClick={() => setShowScoreModal(true)} className="px-8 py-4 text-lg font-semibold">
                <Trophy className="mr-2 h-5 w-5" />
                View My Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="p-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <Trophy className="h-6 w-6 text-primary" />
              Quiz Results
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh] px-6">
            <div className="space-y-12 pb-6">
              {/* Score Display */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary text-primary-foreground">
                  <span className="text-4xl font-bold">{Math.round((score / quizQuestions.length) * 100)}%</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-card-foreground">
                    {score} out of {quizQuestions.length} correct
                  </h3>
                  <div
                    className={`flex items-center justify-center gap-2 ${getPerformanceMessage((score / quizQuestions.length) * 100).color}`}
                  >
                    {(() => {
                      const { icon: Icon } = getPerformanceMessage((score / quizQuestions.length) * 100)
                      return <Icon className="h-6 w-6" />
                    })()}
                    <p className="text-xl font-semibold">
                      {getPerformanceMessage((score / quizQuestions.length) * 100).message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-center text-card-foreground">Performance by Question Type</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {["mcq", "true_false", "fill_in"].map((type) => {
                    const typeQuestions = quizQuestions.filter((q) => q.question_type.toLowerCase() === type)
                    if (typeQuestions.length === 0) return null

                    const typeScore = typeQuestions.reduce((acc, q) => {
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

                    const percentage = Math.round((typeScore / typeQuestions.length) * 100)

                    return (
                      <Card key={type} className="p-6 text-center border border-border bg-card">
                        <Badge className={`${getQuestionTypeColor(type)} mb-4 px-3 py-1 text-sm font-semibold`}>
                          {formatQuestionType(type)}
                        </Badge>
                        <p className="text-3xl font-bold text-card-foreground mb-4">
                          {typeScore}/{typeQuestions.length}
                        </p>
                        <div className="w-full bg-muted rounded-full h-3 mb-4">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-lg font-semibold text-muted-foreground">{percentage}% accuracy</p>
                      </Card>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-bold text-center text-card-foreground">Detailed Answer Review</h4>
                <div className="w-full">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Summary Stats */}
                    <div className="lg:w-1/3">
                      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-6 text-center">
                          <div className="space-y-4">
                            <div className="flex items-center justify-center gap-4">
                              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-5 w-5" />
                                <span className="text-2xl font-bold">{getScoreBreakdown().correctAnswers.length}</span>
                              </div>
                              <div className="w-px h-8 bg-border"></div>
                              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <XCircle className="h-5 w-5" />
                                <span className="text-2xl font-bold">{getScoreBreakdown().wrongAnswers.length}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-muted-foreground">Answer Breakdown</p>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                  style={{
                                    width: `${(getScoreBreakdown().correctAnswers.length / quizQuestions.length) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Answer Details */}
                    <div className="lg:w-2/3">
                      <div className="space-y-6">
                        {/* Correct Answers Section */}
                        {getScoreBreakdown().correctAnswers.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <h5 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                                Correct Answers ({getScoreBreakdown().correctAnswers.length})
                              </h5>
                            </div>
                            <div className="space-y-3">
                              {getScoreBreakdown().correctAnswers.map((answer, idx) => (
                                <div
                                  key={idx}
                                  className="group p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800/50 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold flex-shrink-0">
                                      {answer.index}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 leading-relaxed break-words">
                                          {answer.question}
                                        </p>
                                        <Badge className={`${getQuestionTypeColor(answer.type)} text-xs flex-shrink-0`}>
                                          {formatQuestionType(answer.type)}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                        <Trophy className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-semibold break-words">
                                          Your answer: <span className="font-bold">{answer.userAnswer}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Incorrect Answers Section */}
                        {getScoreBreakdown().wrongAnswers.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <h5 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                Review These ({getScoreBreakdown().wrongAnswers.length})
                              </h5>
                            </div>
                            <div className="space-y-3">
                              {getScoreBreakdown().wrongAnswers.map((answer, idx) => (
                                <div
                                  key={idx}
                                  className="group p-4 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/50 hover:shadow-md transition-all duration-200"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold flex-shrink-0">
                                      {answer.index}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3 mb-3">
                                        <p className="text-sm font-medium text-red-900 dark:text-red-100 leading-relaxed break-words">
                                          {answer.question}
                                        </p>
                                        <Badge className={`${getQuestionTypeColor(answer.type)} text-xs flex-shrink-0`}>
                                          {formatQuestionType(answer.type)}
                                        </Badge>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                                          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm break-words">
                                            <span className="font-medium">Your answer:</span>{" "}
                                            <span className="font-bold">{answer.userAnswer}</span>
                                          </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                                          <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm break-words">
                                            <span className="font-medium">Correct answer:</span>{" "}
                                            <span className="font-bold">{answer.correctAnswer}</span>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Perfect Score Message */}
                        {getScoreBreakdown().wrongAnswers.length === 0 && (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white mb-4">
                              <Trophy className="h-8 w-8" />
                            </div>
                            <h5 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
                              Perfect Score!
                            </h5>
                            <p className="text-emerald-600 dark:text-emerald-400">
                              You answered all questions correctly. Outstanding work!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
