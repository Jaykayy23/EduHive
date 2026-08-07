"use client";

import type React from "react";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Upload,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type QuizSource =
  { type: "text"; content: string } | { type: "file"; content: File };

interface InputSectionProps {
  onSourceChange: (source: QuizSource | null) => void;
}

const MINIMUM_TEXT_LENGTH = 150;

export function InputSection({ onSourceChange }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textIsReady = textInput.trim().length >= MINIMUM_TEXT_LENGTH;
  const sourceIsReady = activeTab === "text" ? textIsReady : file !== null;

  const updateActiveSource = (nextTab: string) => {
    setActiveTab(nextTab);
    setError(null);

    if (nextTab === "text" && textIsReady) {
      onSourceChange({ type: "text", content: textInput.trim() });
      return;
    }

    if (nextTab === "file" && file) {
      onSourceChange({ type: "file", content: file });
      return;
    }

    onSourceChange(null);
  };

  const handleTextChange = (value: string) => {
    setTextInput(value);
    setError(null);

    if (activeTab !== "text") return;
    onSourceChange(
      value.trim().length >= MINIMUM_TEXT_LENGTH
        ? { type: "text", content: value.trim() }
        : null,
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    const allowedExtensions = [".txt", ".pdf", ".docx", ".doc"];

    if (!selectedFile) {
      setFile(null);
      onSourceChange(null);
      return;
    }

    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      setError("Choose a TXT, PDF, DOC, or DOCX file.");
      setFile(null);
      onSourceChange(null);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
    onSourceChange({ type: "file", content: selectedFile });
  };

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg text-sm">
            1
          </span>
          Add your study material
        </CardTitle>
        <CardDescription>
          Paste complete notes or upload a supported document.
        </CardDescription>
        {sourceIsReady && (
          <CardAction>
            <Badge variant="secondary">
              <CheckCircle2 aria-hidden="true" />
              Ready
            </Badge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={updateActiveSource}>
          <TabsList>
            <TabsTrigger value="text">
              <FileText aria-hidden="true" />
              Paste notes
            </TabsTrigger>
            <TabsTrigger value="file">
              <Upload aria-hidden="true" />
              Upload file
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hiveq-text-input">Your notes</Label>
              <Textarea
                id="hiveq-text-input"
                value={textInput}
                onChange={(event) => handleTextChange(event.target.value)}
                placeholder="Paste at least 150 characters of study material."
                aria-describedby="hiveq-text-description"
                className="min-h-64 resize-y leading-relaxed"
              />
              <div
                id="hiveq-text-description"
                className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <span>Minimum {MINIMUM_TEXT_LENGTH} characters</span>
                <span aria-live="polite">
                  {textInput.trim().length} characters
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="file" className="mt-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="hiveq-file-input">Choose a document</Label>
                <Input
                  id="hiveq-file-input"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  aria-describedby="hiveq-file-description"
                  aria-invalid={error !== null}
                  className="cursor-pointer"
                />
                <p
                  id="hiveq-file-description"
                  className="text-muted-foreground text-xs"
                >
                  Supported formats: TXT, PDF, DOC, and DOCX.
                </p>
              </div>

              {file && (
                <Alert>
                  <CheckCircle2 aria-hidden="true" />
                  <AlertTitle className="break-all">{file.name}</AlertTitle>
                  <AlertDescription>
                    {(file.size / 1024).toFixed(1)} KB ready to use
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>File not supported</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground mt-5 flex items-start gap-2 text-xs leading-relaxed">
          <Lightbulb
            className="text-primary mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>
            Clear headings and complete sentences produce stronger questions.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
