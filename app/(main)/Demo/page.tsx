'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, Download, Brain, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Question {
  question_statement: string
  question_type: string
  answer: string | boolean
  options?: string[]
  context?: string
}

const demoQuestions: Question[] = [
  {
    question_statement: "What is the primary function of mitochondria in a cell?",
    question_type: "mcq",
    answer: "Energy production through cellular respiration",
    options: [
      "Protein synthesis",
      "Energy production through cellular respiration",
      "DNA replication",
      "Waste removal"
    ]
  },
  {
    question_statement: "Photosynthesis occurs only in plant cells.",
    question_type: "true_false",
    answer: true
  },
  {
    question_statement: "The process by which plants convert sunlight into chemical energy is called ________.",
    question_type: "fill_in",
    answer: "photosynthesis"
  },
  {
    question_statement: "Which organelle is responsible for controlling what enters and exits the cell?",
    question_type: "mcq",
    answer: "Cell membrane",
    options: [
      "Nucleus",
      "Cell membrane",
      "Cytoplasm",
      "Ribosome"
    ]
  },
  {
    question_statement: "All living organisms are made up of cells.",
    question_type: "true_false",
    answer: true
  },
  {
    question_statement: "The ________ is often called the 'powerhouse of the cell' because it produces ATP.",
    question_type: "fill_in",
    answer: "mitochondrion"
  },
  {
    question_statement: "What is the main difference between prokaryotic and eukaryotic cells?",
    question_type: "mcq",
    answer: "Presence of a membrane-bound nucleus",
    options: [
      "Size of the cell",
      "Presence of a membrane-bound nucleus",
      "Number of chromosomes",
      "Type of cell wall"
    ]
  },
  {
    question_statement: "Chloroplasts are found in both plant and animal cells.",
    question_type: "true_false",
    answer: false
  },
  {
    question_statement: "The gel-like substance that fills the cell and holds organelles in place is called ________.",
    question_type: "fill_in",
    answer: "cytoplasm"
  },
  {
    question_statement: "Which process allows cells to divide and create identical copies of themselves?",
    question_type: "mcq",
    answer: "Mitosis",
    options: [
      "Meiosis",
      "Mitosis",
      "Photosynthesis",
      "Respiration"
    ]
  },
  {
    question_statement: "DNA is stored in the nucleus of eukaryotic cells.",
    question_type: "true_false",
    answer: true
  },
  {
    question_statement: "The ________ is responsible for protein synthesis in the cell.",
    question_type: "fill_in",
    answer: "ribosome"
  },
  {
    question_statement: "What is the primary component of the cell wall in plants?",
    question_type: "mcq",
    answer: "Cellulose",
    options: [
      "Protein",
      "Lipids",
      "Cellulose",
      "Starch"
    ]
  },
  {
    question_statement: "Osmosis is the movement of water across a semipermeable membrane.",
    question_type: "true_false",
    answer: true
  },
  {
    question_statement: "The process of ________ allows substances to move from high concentration to low concentration without energy.",
    question_type: "fill_in",
    answer: "diffusion"
  }
]

const generatedResponse = {
  source_text: "Cell biology is the study of cell structure and function, and it revolves around the concept that the cell is the fundamental unit of life. Cells are the basic building blocks of all living things. The human body is composed of trillions of cells. They provide structure for the body, take in nutrients from food, convert those nutrients into energy, and carry out specialized functions. Cells also contain the body's hereditary material and can make copies of themselves. Cells have many parts, each with a different function. Some of these parts, called organelles, are specialized structures that perform certain tasks within the cell...",
  questions: demoQuestions
}

export default function BrainForgeDemoPage() {
  const getQuestionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mcq':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'true_false':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'fill_in':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatQuestionType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mcq':
        return 'Multiple Choice'
      case 'true_false':
        return 'True/False'
      case 'fill_in':
        return 'Fill in the Blank'
      default:
        return type
    }
  }

  const exportQuestions = () => {
    const exportData = {
      generated_at: new Date().toISOString(),
      source_text_preview: generatedResponse.source_text.substring(0, 200) + '...',
      total_questions: generatedResponse.questions.length,
      questions: generatedResponse.questions
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brainforge-demo-questions-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Demo questions exported successfully!')
  }

  const questionTypeStats = {
    mcq: demoQuestions.filter(q => q.question_type === 'mcq').length,
    true_false: demoQuestions.filter(q => q.question_type === 'true_false').length,
    fill_in: demoQuestions.filter(q => q.question_type === 'fill_in').length
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <Link href="/brainforge">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to BrainForge
          </Button>
        </Link>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              BrainForge Demo
            </h1>
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Preview of generated questions from a sample biology text about cell structure and function.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{demoQuestions.length}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{questionTypeStats.mcq}</div>
            <div className="text-sm text-muted-foreground">Multiple Choice</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{questionTypeStats.true_false}</div>
            <div className="text-sm text-muted-foreground">True/False</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{questionTypeStats.fill_in}</div>
            <div className="text-sm text-muted-foreground">Fill in the Blank</div>
          </CardContent>
        </Card>
      </div>

      {/* Source Text Preview */}
      <Card className="mb-8 rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            📚 Source Content Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic leading-relaxed">
            "{generatedResponse.source_text.substring(0, 300)}..."
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Generated Questions
              <Badge variant="secondary" className="ml-2">
                {generatedResponse.questions.length} questions
              </Badge>
            </CardTitle>
            <Button onClick={exportQuestions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[800px] pr-4">
            <div className="space-y-6">
              {generatedResponse.questions.map((question, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 leading-relaxed">
                        {index + 1}. {question.question_statement}
                      </h3>
                      <Badge className={getQuestionTypeColor(question.question_type)}>
                        {formatQuestionType(question.question_type)}
                      </Badge>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border transition-colors ${
                              option === question.answer
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <span className="font-medium mr-2 text-primary">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            {option}
                            {option === question.answer && (
                              <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === 'fill_in' && (
                      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-purple-800 dark:text-purple-200">
                          <strong>Expected Answer:</strong> {question.answer}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Answer:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          {typeof question.answer === 'boolean' 
                            ? (question.answer ? 'True' : 'False')
                            : question.answer
                          }
                        </Badge>
                      </div>
                      
                      {question.question_type === 'true_false' && (
                        <div className="text-xs text-muted-foreground">
                          {question.answer ? '✓ True' : '✗ False'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/brainforge">
          <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <Brain className="h-4 w-4 mr-2" />
            Try BrainForge Now
          </Button>
        </Link>
        <Button onClick={exportQuestions} variant="outline" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Export These Questions
        </Button>
      </div>
    </div>
  )
}
