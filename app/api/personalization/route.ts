import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth-server";
import {
  isAcademicLevel,
  isLearningGoal,
  isPersonalizationSubject,
  isPreferredStudyMode,
  isWeeklyStudySessions,
  type PersonalizationResponse,
} from "@/lib/personalization";
import prisma from "@/lib/prisma";

export async function GET() {
  const { user } = await validateRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  if (!preferences) {
    return NextResponse.json(
      { error: "Personalization not found" },
      { status: 404 },
    );
  }

  if (
    !isAcademicLevel(preferences.academicLevel) ||
    !isWeeklyStudySessions(preferences.weeklyStudySessions)
  ) {
    return NextResponse.json(
      { error: "Personalization is invalid" },
      { status: 500 },
    );
  }

  const response: PersonalizationResponse = {
    subjects: preferences.subjects.filter(isPersonalizationSubject),
    goals: preferences.goals.filter(isLearningGoal),
    studyModes: preferences.studyModes.filter(isPreferredStudyMode),
    academicLevel: preferences.academicLevel,
    weeklyStudySessions: preferences.weeklyStudySessions,
  };

  return NextResponse.json(response);
}
