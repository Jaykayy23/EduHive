import type { TutorMode } from "./tutor-modes";

export const PERSONALIZATION_SUBJECT_IDS = [
  "computer-science",
  "mathematics",
  "physics",
  "chemistry",
  "biology",
  "biochemistry",
  "food-science",
  "agriculture",
  "engineering",
  "medicine",
  "psychology",
] as const;

export type PersonalizationSubject =
  (typeof PERSONALIZATION_SUBJECT_IDS)[number];

export const PERSONALIZATION_SUBJECTS: ReadonlyArray<{
  value: PersonalizationSubject;
  label: string;
  description: string;
  searchTerms: readonly string[];
}> = [
  {
    value: "computer-science",
    label: "Computer Science",
    description: "Software, data, AI, and systems",
    searchTerms: [
      "computer",
      "programming",
      "software",
      "algorithm",
      "database",
      "machine",
      "learning",
      "code",
    ],
  },
  {
    value: "mathematics",
    label: "Mathematics",
    description: "Algebra, calculus, proofs, and statistics",
    searchTerms: [
      "mathematics",
      "math",
      "algebra",
      "calculus",
      "statistics",
      "equation",
      "proof",
    ],
  },
  {
    value: "physics",
    label: "Physics",
    description: "Mechanics, energy, waves, and matter",
    searchTerms: [
      "physics",
      "mechanics",
      "energy",
      "quantum",
      "thermodynamics",
      "wave",
    ],
  },
  {
    value: "chemistry",
    label: "Chemistry",
    description: "Molecules, reactions, and laboratory science",
    searchTerms: [
      "chemistry",
      "chemical",
      "molecule",
      "reaction",
      "organic",
      "compound",
    ],
  },
  {
    value: "biology",
    label: "Human Biology",
    description: "Cells, genetics, anatomy, and physiology",
    searchTerms: [
      "biology",
      "cell",
      "genetics",
      "anatomy",
      "physiology",
      "immunology",
    ],
  },
  {
    value: "biochemistry",
    label: "Biochemistry",
    description: "Proteins, enzymes, and metabolism",
    searchTerms: [
      "biochemistry",
      "protein",
      "enzyme",
      "metabolism",
      "amino",
      "molecular",
    ],
  },
  {
    value: "food-science",
    label: "Food Science",
    description: "Nutrition, safety, and food technology",
    searchTerms: [
      "food",
      "nutrition",
      "safety",
      "diet",
      "preservation",
      "ingredients",
    ],
  },
  {
    value: "agriculture",
    label: "Agriculture",
    description: "Crops, soil, farming, and sustainability",
    searchTerms: [
      "agriculture",
      "farming",
      "crop",
      "soil",
      "plant",
      "livestock",
    ],
  },
  {
    value: "engineering",
    label: "Engineering",
    description: "Design, systems, structures, and machines",
    searchTerms: [
      "engineering",
      "mechanical",
      "electrical",
      "civil",
      "structural",
      "design",
    ],
  },
  {
    value: "medicine",
    label: "Medicine",
    description: "Clinical science, health, and pharmacology",
    searchTerms: [
      "medicine",
      "medical",
      "clinical",
      "health",
      "diagnosis",
      "pharmacology",
    ],
  },
  {
    value: "psychology",
    label: "Psychology",
    description: "Mind, behavior, cognition, and wellbeing",
    searchTerms: [
      "psychology",
      "behavior",
      "cognitive",
      "brain",
      "emotion",
      "neuroscience",
    ],
  },
];

export const LEARNING_GOAL_IDS = [
  "understand",
  "exam-prep",
  "coursework",
  "practical-skills",
] as const;

export type LearningGoal = (typeof LEARNING_GOAL_IDS)[number];

export const LEARNING_GOALS: ReadonlyArray<{
  value: LearningGoal;
  label: string;
}> = [
  { value: "understand", label: "Understand difficult concepts" },
  { value: "exam-prep", label: "Prepare for exams" },
  { value: "coursework", label: "Keep up with coursework" },
  { value: "practical-skills", label: "Build practical skills" },
];

export const ACADEMIC_LEVEL_IDS = [
  "starting-out",
  "undergraduate",
  "postgraduate",
  "independent",
] as const;

export type AcademicLevel = (typeof ACADEMIC_LEVEL_IDS)[number];

export const ACADEMIC_LEVELS: ReadonlyArray<{
  value: AcademicLevel;
  label: string;
}> = [
  { value: "starting-out", label: "Getting started" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "independent", label: "Independent learner" },
];

export const PREFERRED_STUDY_MODE_IDS = [
  "explain",
  "summarize",
  "flashcards",
  "quiz",
] as const satisfies readonly TutorMode[];

export type PreferredStudyMode = (typeof PREFERRED_STUDY_MODE_IDS)[number];

export const PREFERRED_STUDY_MODES: ReadonlyArray<{
  value: PreferredStudyMode;
  label: string;
}> = [
  { value: "explain", label: "Clear explanations" },
  { value: "summarize", label: "Focused summaries" },
  { value: "flashcards", label: "Flashcards" },
  { value: "quiz", label: "Practice quizzes" },
];

export const WEEKLY_STUDY_SESSIONS = [3, 5, 7] as const;

export type WeeklyStudySessions = (typeof WEEKLY_STUDY_SESSIONS)[number];

export const WEEKLY_STUDY_OPTIONS: ReadonlyArray<{
  value: WeeklyStudySessions;
  label: string;
}> = [
  { value: 3, label: "A few times a week" },
  { value: 5, label: "Most weekdays" },
  { value: 7, label: "Every day" },
];

export interface PersonalizationResponse {
  subjects: PersonalizationSubject[];
  goals: LearningGoal[];
  studyModes: PreferredStudyMode[];
  academicLevel: AcademicLevel;
  weeklyStudySessions: WeeklyStudySessions;
}

export function isPersonalizationSubject(
  value: string,
): value is PersonalizationSubject {
  return PERSONALIZATION_SUBJECT_IDS.includes(value as PersonalizationSubject);
}

export function isLearningGoal(value: string): value is LearningGoal {
  return LEARNING_GOAL_IDS.includes(value as LearningGoal);
}

export function isAcademicLevel(value: string): value is AcademicLevel {
  return ACADEMIC_LEVEL_IDS.includes(value as AcademicLevel);
}

export function isPreferredStudyMode(
  value: string,
): value is PreferredStudyMode {
  return PREFERRED_STUDY_MODE_IDS.includes(value as PreferredStudyMode);
}

export function isWeeklyStudySessions(
  value: number,
): value is WeeklyStudySessions {
  return WEEKLY_STUDY_SESSIONS.includes(value as WeeklyStudySessions);
}

export function buildSubjectRelevanceQuery(
  subjects: readonly string[],
): string | null {
  const selectedSubjects = new Set(subjects);
  const terms = PERSONALIZATION_SUBJECTS.flatMap((subject) =>
    selectedSubjects.has(subject.value) ? subject.searchTerms : [],
  );
  const uniqueTerms = [...new Set(terms.map((term) => term.toLowerCase()))];

  return uniqueTerms.length ? uniqueTerms.join(" | ") : null;
}

export function getPreferredStudyMode(
  studyModes: readonly string[] | null | undefined,
): PreferredStudyMode {
  const preferredMode = studyModes?.find((mode) =>
    PREFERRED_STUDY_MODE_IDS.includes(mode as PreferredStudyMode),
  );

  return (preferredMode as PreferredStudyMode | undefined) ?? "summarize";
}
