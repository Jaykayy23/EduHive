"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ACADEMIC_LEVELS,
  LEARNING_GOALS,
  PERSONALIZATION_SUBJECTS,
  PREFERRED_STUDY_MODES,
  WEEKLY_STUDY_OPTIONS,
  type PersonalizationResponse,
  type PersonalizationSubject,
  type WeeklyStudySessions,
} from "@/lib/personalization";
import {
  personalizationSchema,
  type PersonalizationValues,
} from "@/lib/validation";
import { savePersonalization } from "./actions";

const stepContent = [
  {
    title: "Choose your subjects",
    description:
      "Pick up to five areas so Explore can put the most relevant posts first.",
  },
  {
    title: "Tell us what success looks like",
    description:
      "Your level and goals help EduHive shape recommendations around your needs.",
  },
  {
    title: "Set your study rhythm",
    description:
      "Choose the formats you use most and a pace that feels realistic.",
  },
] as const;

interface OnboardingFormProps {
  displayName: string;
  initialValues: PersonalizationResponse;
  isEditing: boolean;
}

export default function OnboardingForm({
  displayName,
  initialValues,
  isEditing,
}: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<PersonalizationValues>(initialValues);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentStep = stepContent[step];
  const progress = ((step + 1) / stepContent.length) * 100;

  function toggleSubject(subject: PersonalizationSubject) {
    setSelectionError(null);
    setValues((current) => ({
      ...current,
      subjects: current.subjects.includes(subject)
        ? current.subjects.filter((value) => value !== subject)
        : [...current.subjects, subject],
    }));
  }

  function validateStep() {
    if (step === 0 && values.subjects.length === 0) {
      setSelectionError("Choose at least one subject to continue.");
      return false;
    }

    if (step === 1 && values.goals.length === 0) {
      setSelectionError("Choose at least one learning goal to continue.");
      return false;
    }

    if (step === 2 && values.studyModes.length === 0) {
      setSelectionError("Choose at least one study mode to finish setup.");
      return false;
    }

    setSelectionError(null);
    return true;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (!validateStep()) return;

    if (step < stepContent.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    const parsed = personalizationSchema.safeParse(values);
    if (!parsed.success) {
      setSelectionError(
        parsed.error.issues[0]?.message ?? "Review your choices and try again.",
      );
      return;
    }

    startTransition(async () => {
      const result = await savePersonalization(parsed.data);
      if (result.error) setServerError(result.error);
    });
  }

  return (
    <Card className="w-full max-w-4xl overflow-hidden">
      <CardHeader className="gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <Image
          src="/images/eduhive-icon.png"
          alt="EduHive"
          width={64}
          height={64}
          className="size-14 object-contain sm:row-span-2 sm:size-16"
          priority
        />
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-xl sm:text-2xl">
            {isEditing
              ? "Update your learning preferences"
              : `Welcome, ${displayName}`}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Tune what appears in Explore and how Study this starts."
              : "A few choices will make your feed and AI study tools feel more relevant."}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-7">
          <Field className="gap-2">
            <div className="flex items-center justify-between gap-4">
              <FieldLabel>Setup progress</FieldLabel>
              <span className="text-muted-foreground text-sm tabular-nums">
                {step + 1} of {stepContent.length}
              </span>
            </div>
            <Progress
              value={progress}
              aria-label={`Setup step ${step + 1} of ${stepContent.length}`}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl">{currentStep.title}</h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              {currentStep.description}
            </p>
          </div>

          {step === 0 && (
            <FieldSet data-invalid={Boolean(selectionError)}>
              <FieldLegend>Subjects</FieldLegend>
              <FieldDescription>
                Your top interests rank first. You can still browse every
                subject.
              </FieldDescription>
              <FieldGroup
                data-slot="checkbox-group"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {PERSONALIZATION_SUBJECTS.map((subject) => {
                  const checked = values.subjects.includes(subject.value);
                  const disabled = values.subjects.length >= 5 && !checked;

                  return (
                    <FieldLabel key={subject.value}>
                      <Field
                        orientation="horizontal"
                        data-disabled={disabled || undefined}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleSubject(subject.value)}
                          aria-label={subject.label}
                          aria-invalid={Boolean(selectionError)}
                        />
                        <FieldContent>
                          <FieldTitle>{subject.label}</FieldTitle>
                          <FieldDescription>
                            {subject.description}
                          </FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  );
                })}
              </FieldGroup>
              <FieldError>{selectionError}</FieldError>
            </FieldSet>
          )}

          {step === 1 && (
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Your current level</FieldLegend>
                <FieldDescription>
                  Pick the description that best matches you today.
                </FieldDescription>
                <ToggleGroup
                  type="single"
                  value={values.academicLevel}
                  onValueChange={(academicLevel) => {
                    if (!academicLevel) return;
                    setValues((current) => ({
                      ...current,
                      academicLevel:
                        academicLevel as PersonalizationValues["academicLevel"],
                    }));
                  }}
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
                  aria-label="Current learning level"
                >
                  {ACADEMIC_LEVELS.map((level) => (
                    <ToggleGroupItem
                      key={level.value}
                      value={level.value}
                      className="w-full justify-start"
                    >
                      {level.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>

              <FieldSet data-invalid={Boolean(selectionError)}>
                <FieldLegend>Your learning goals</FieldLegend>
                <FieldDescription>Choose up to three goals.</FieldDescription>
                <ToggleGroup
                  type="multiple"
                  value={values.goals}
                  onValueChange={(goals) => {
                    if (goals.length > 3) return;
                    setSelectionError(null);
                    setValues((current) => ({
                      ...current,
                      goals: goals as PersonalizationValues["goals"],
                    }));
                  }}
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
                  aria-label="Learning goals"
                >
                  {LEARNING_GOALS.map((goal) => (
                    <ToggleGroupItem
                      key={goal.value}
                      value={goal.value}
                      className="w-full justify-start"
                    >
                      {goal.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldError>{selectionError}</FieldError>
              </FieldSet>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <FieldSet data-invalid={Boolean(selectionError)}>
                <FieldLegend>Preferred study formats</FieldLegend>
                <FieldDescription>Choose up to three formats.</FieldDescription>
                <ToggleGroup
                  type="multiple"
                  value={values.studyModes}
                  onValueChange={(studyModes) => {
                    if (studyModes.length > 3) return;
                    setSelectionError(null);
                    setValues((current) => ({
                      ...current,
                      studyModes:
                        studyModes as PersonalizationValues["studyModes"],
                    }));
                  }}
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
                  aria-label="Preferred study formats"
                >
                  {PREFERRED_STUDY_MODES.map((mode) => (
                    <ToggleGroupItem
                      key={mode.value}
                      value={mode.value}
                      className="w-full justify-start"
                    >
                      {mode.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldError>{selectionError}</FieldError>
              </FieldSet>

              <FieldSet>
                <FieldLegend>Weekly rhythm</FieldLegend>
                <FieldDescription>
                  Choose a target you can maintain.
                </FieldDescription>
                <ToggleGroup
                  type="single"
                  value={String(values.weeklyStudySessions)}
                  onValueChange={(weeklyStudySessions) => {
                    if (!weeklyStudySessions) return;
                    setValues((current) => ({
                      ...current,
                      weeklyStudySessions: Number(
                        weeklyStudySessions,
                      ) as WeeklyStudySessions,
                    }));
                  }}
                  variant="outline"
                  spacing={2}
                  className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3"
                  aria-label="Weekly study rhythm"
                >
                  {WEEKLY_STUDY_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={String(option.value)}
                      className="w-full justify-start sm:justify-center"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </FieldSet>
            </FieldGroup>
          )}

          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="mt-7 flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSelectionError(null);
              setStep((current) => Math.max(0, current - 1));
            }}
            disabled={step === 0 || isPending}
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          <LoadingButton loading={isPending} type="submit">
            {step === stepContent.length - 1 ? (
              <>
                <Check data-icon="inline-start" />
                {isEditing ? "Save preferences" : "Finish setup"}
              </>
            ) : (
              <>
                Continue
                <ArrowRight data-icon="inline-end" />
              </>
            )}
          </LoadingButton>
        </CardFooter>
      </form>
    </Card>
  );
}
