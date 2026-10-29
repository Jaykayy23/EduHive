"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DEMO_SAMPLES,
  createDemoExport,
  scoreDemo,
  isDemoAnswerCorrect,
  type DemoSample,
  type DemoAnswers,
} from "@/lib/demo-study";

function SampleQuiz({ sample }: { sample: DemoSample }) {
  const [answers, setAnswers] = useState<DemoAnswers>({});
  const [reviewed, setReviewed] = useState(false);
  const score = scoreDemo(sample.questions, answers);

  function exportSample() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(createDemoExport(sample, answers), null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `eduhive-${sample.id}-sample.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              01 / Read the notes
            </Badge>
            <CardTitle>{sample.title}</CardTitle>
            <CardDescription>
              Short source passage · {sample.subject}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-8">{sample.source}</p>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-sm">
              In the full app, paste your own material or upload a PDF, DOCX, or
              text file.
            </p>
          </CardFooter>
        </Card>
        <p className="text-muted-foreground max-w-md text-sm leading-6">
          This demo uses fixed, reviewed examples. It does not upload documents,
          call an AI service, or save your answers. Live AI output should always
          be checked for accuracy.
        </p>
      </aside>

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            02 / Test your recall
          </Badge>
          <CardTitle>Three ways to check what stuck.</CardTitle>
          <CardDescription>
            Try multiple choice, true or false, and a short fill-in answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="sample-quiz"
            onSubmit={(event) => {
              event.preventDefault();
              setReviewed(true);
            }}
          >
            <FieldGroup>
              {sample.questions.map((question, index) => (
                <FieldSet
                  key={question.id}
                  disabled={reviewed}
                  className="rounded-xl border p-5"
                >
                  <FieldLegend variant="label">
                    {index + 1}. {question.prompt}
                  </FieldLegend>
                  <p className="text-muted-foreground text-xs">
                    {question.type}
                  </p>
                  {question.options ? (
                    <FieldGroup className="gap-3">
                      {question.options.map((option) => (
                        <Field key={option} orientation="horizontal">
                          <input
                            id={`${question.id}-${question.options!.indexOf(option)}`}
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: option,
                              }))
                            }
                            className="accent-primary size-4 shrink-0"
                          />
                          <FieldLabel
                            htmlFor={`${question.id}-${question.options!.indexOf(option)}`}
                          >
                            {option}
                          </FieldLabel>
                        </Field>
                      ))}
                    </FieldGroup>
                  ) : (
                    <Field>
                      <FieldLabel htmlFor={question.id} className="sr-only">
                        Answer to question {index + 1}
                      </FieldLabel>
                      <Input
                        id={question.id}
                        name={question.id}
                        autoComplete="off"
                        placeholder="Your answer"
                        value={answers[question.id] ?? ""}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: event.target.value,
                          }))
                        }
                      />
                    </Field>
                  )}
                  {reviewed && (
                    <div className="flex flex-col gap-2 border-t pt-4">
                      <p className="text-sm font-medium">
                        {isDemoAnswerCorrect(question, answers[question.id])
                          ? "Correct"
                          : !(answers[question.id] ?? "").trim()
                            ? "Not answered"
                            : "Keep practicing"}{" "}
                        · Answer: {question.answer}
                      </p>
                      <p className="text-muted-foreground text-sm leading-6">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </FieldSet>
              ))}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <p role="status" aria-live="polite" className="text-sm">
            {reviewed
              ? `You scored ${score.correct} of ${score.total}. Review the explanations above.`
              : `${score.answered} of ${score.total} answered. You can review a partial attempt.`}
          </p>
          <div className="flex flex-wrap gap-3">
            {!reviewed && (
              <Button form="sample-quiz" type="submit">
                Review answers
                <ArrowRight className="size-4" />
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setAnswers({});
                setReviewed(false);
              }}
            >
              <RotateCcw className="size-4" />
              Reset quiz
            </Button>
            <Button variant="ghost" type="button" onClick={exportSample}>
              <Download className="size-4" />
              Export sample
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function StudyDemo() {
  const [sampleId, setSampleId] = useState(DEMO_SAMPLES[0].id);
  const sample =
    DEMO_SAMPLES.find((item) => item.id === sampleId) ?? DEMO_SAMPLES[0];
  return (
    <div className="bg-background text-foreground min-h-svh">
      <header className="border-b">
        <nav
          aria-label="Demo navigation"
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6"
        >
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image
              src="/images/eduhive-icon.png"
              alt=""
              width={32}
              height={32}
            />
            EduHive
          </Link>
          <Button asChild variant="outline">
            <Link href="/signup">
              Create an account
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex max-w-2xl flex-col items-start gap-5">
          <Link
            href="/"
            className="text-muted-foreground flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            Back to EduHive
          </Link>
          <Badge variant="outline">
            Interactive sample · No account needed
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            From notes to
            <br />
            “I know this.”
          </h1>
          <p className="text-muted-foreground text-lg leading-8">
            See how HiveQ turns study material into a recall session. Read the
            notes, try the questions, and find out what needs another look.
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            value={sampleId}
            onValueChange={(value) => {
              if (value) setSampleId(value);
            }}
            aria-label="Sample subject"
          >
            {DEMO_SAMPLES.map((item) => (
              <ToggleGroupItem key={item.id} value={item.id}>
                {item.subject}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <SampleQuiz key={sample.id} sample={sample} />
        <section className="bg-muted flex flex-col items-start gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">
              Bring your own notes next.
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
              Create an account to generate quizzes from your material, work
              through ideas with the AI tutor, and learn with the community.
            </p>
          </div>
          <Button asChild>
            <Link href="/signup">
              Join EduHive
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="text-muted-foreground border-t px-4 py-6 text-center text-sm">
        EduHive · Sample answers stay in this page until you reset, switch
        subjects, or leave.
      </footer>
    </div>
  );
}
