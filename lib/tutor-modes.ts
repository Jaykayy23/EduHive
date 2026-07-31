import { z } from "zod"

export const tutorModes = ["explain", "quiz", "flashcards", "practice-exam", "summarize", "simplify", "compare", "step-by-step"] as const
export const tutorModeSchema = z.enum(tutorModes)
export type TutorMode = z.infer<typeof tutorModeSchema>
