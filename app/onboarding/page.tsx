import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@/app/auth";
import prisma from "@/lib/prisma";
import {
  isAcademicLevel,
  isLearningGoal,
  isPersonalizationSubject,
  isPreferredStudyMode,
  isWeeklyStudySessions,
  type PersonalizationResponse,
} from "@/lib/personalization";
import OnboardingForm from "./OnboardingForm";

export const metadata: Metadata = {
  title: "Personalize your learning",
  description: "Choose what and how you want to learn on EduHive.",
};

const emptyPreferences: PersonalizationResponse = {
  subjects: [],
  goals: [],
  studyModes: ["summarize"],
  academicLevel: "undergraduate",
  weeklyStudySessions: 3,
};

export default async function OnboardingPage() {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  const initialValues: PersonalizationResponse = preferences
    ? {
        subjects: preferences.subjects.filter(isPersonalizationSubject),
        goals: preferences.goals.filter(isLearningGoal),
        studyModes: preferences.studyModes.filter(isPreferredStudyMode),
        academicLevel: isAcademicLevel(preferences.academicLevel)
          ? preferences.academicLevel
          : emptyPreferences.academicLevel,
        weeklyStudySessions: isWeeklyStudySessions(
          preferences.weeklyStudySessions,
        )
          ? preferences.weeklyStudySessions
          : emptyPreferences.weeklyStudySessions,
      }
    : emptyPreferences;

  return (
    <main className="bg-gradient-surface flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <OnboardingForm
        displayName={user.displayName}
        initialValues={initialValues}
        isEditing={Boolean(preferences)}
      />
    </main>
  );
}
