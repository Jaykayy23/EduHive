import { z } from "zod";
import {
  ACADEMIC_LEVEL_IDS,
  LEARNING_GOAL_IDS,
  PERSONALIZATION_SUBJECT_IDS,
  PREFERRED_STUDY_MODE_IDS,
  WEEKLY_STUDY_SESSIONS,
} from "./personalization";

const requiredString = z.string().trim().min(1, "Required");

export const emailSchema = requiredString.email("Invalid email address");
export const passwordSchema = requiredString.min(
  8,
  "Password must be at least 8 characters",
);

export const signUpSchema = z.object({
  email: emailSchema,
  username: requiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers,- and _ allowed",
  ),
  password: passwordSchema,
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z
    .array(z.string())
    .max(5, "You can only attach up to 5 media items"),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Bio must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const personalizationSchema = z.object({
  subjects: z
    .array(z.enum(PERSONALIZATION_SUBJECT_IDS))
    .min(1, "Choose at least one subject")
    .max(5, "Choose up to five subjects"),
  goals: z
    .array(z.enum(LEARNING_GOAL_IDS))
    .min(1, "Choose at least one learning goal")
    .max(3, "Choose up to three learning goals"),
  studyModes: z
    .array(z.enum(PREFERRED_STUDY_MODE_IDS))
    .min(1, "Choose at least one study mode")
    .max(3, "Choose up to three study modes"),
  academicLevel: z.enum(ACADEMIC_LEVEL_IDS),
  weeklyStudySessions: z
    .number()
    .int()
    .refine(
      (value) =>
        WEEKLY_STUDY_SESSIONS.includes(
          value as (typeof WEEKLY_STUDY_SESSIONS)[number],
        ),
      "Choose a weekly study rhythm",
    ),
});

export type PersonalizationValues = z.infer<typeof personalizationSchema>;

export const createCommentSchema = z.object({
  content: requiredString,
});
