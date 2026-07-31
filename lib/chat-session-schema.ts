import { z } from "zod"
import { tutorModeSchema } from "@/lib/tutor-modes"

export const MAX_STORED_CHAT_MESSAGES = 100
export const MAX_STORED_CHAT_MESSAGE_LENGTH = 4_000

export const chatMessageSchema = z
  .object({
    id: z.string().uuid(),
    content: z.string().trim().min(1).max(MAX_STORED_CHAT_MESSAGE_LENGTH),
    isUser: z.boolean(),
    timestamp: z.coerce.date(),
    mode: tutorModeSchema.optional(),
  })
  .strict()

export const chatSessionPayloadSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(120),
    messages: z.array(chatMessageSchema).min(1).max(MAX_STORED_CHAT_MESSAGES),
  })
  .strict()

export const chatSessionIdSchema = z.string().uuid()
