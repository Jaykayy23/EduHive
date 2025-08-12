// brainforge/components/input-section.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Sparkles, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface InputSectionProps {
  isLoading: boolean
  onGenerate: (source: { type: "text"; content: string } | { type: "file"; content: File }) => void
  onReset: () => void
}

export function InputSection({ isLoading, onGenerate, onReset }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState("text")
  const [textInput, setTextInput] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = [".txt", ".pdf", ".docx", ".doc"]
      const fileExtension = "." + selectedFile.name.split(".").pop()?.toLowerCase()

      if (allowedTypes.includes(fileExtension)) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please upload a valid file type: TXT, PDF, DOC, or DOCX")
        setFile(null)
      }
    }
  }

  const handleGenerateClick = () => {
    if (activeTab === "text") {
      if (!textInput.trim()) {
        toast.error("Please enter some text to generate questions from")
        return
      }
      if (textInput.length < 150) {
        toast.error("Text must be at least 150 characters long")
        return
      }
      onGenerate({ type: "text", content: textInput })
    } else {
      if (!file) {
        toast.error("Please select a file to upload")
        return
      }
      onGenerate({ type: "file", content: file })
    }
  }

  const handleResetClick = () => {
    setTextInput("")
    setFile(null)
    setError(null)
    onReset()
  }

  return (
    <Card className="rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6" />
          Content Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Text Input
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> File Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 pt-4">
            <Label htmlFor="text-input" className="text-base font-medium">
              Enter your educational content
            </Label>
            <Textarea
              id="text-input"
              placeholder="Paste your educational content here... (minimum 150 characters)"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{textInput.length} characters</span>
              {textInput.length >= 150 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Ready
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 pt-4">
            <Label htmlFor="file-input" className="text-base font-medium">
              Upload a document
            </Label>
            <Input
              id="file-input"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-muted-foreground text-sm">Supported formats: TXT, PDF, DOC, DOCX</p>
            {file && (
              <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">{file.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleGenerateClick}
            disabled={isLoading || (activeTab === "text" ? !textInput.trim() || textInput.length < 150 : !file)}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
          <Button onClick={handleResetClick} variant="outline" size="lg" disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
