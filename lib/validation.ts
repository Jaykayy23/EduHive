import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const emailSchema = requiredString
  .max(254, "Email must be at most 254 characters")
  .email("Invalid email address");
export const passwordSchema = requiredString
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const signUpSchema = z.object({
  email: emailSchema,
  username: requiredString
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, - and _ are allowed",
    ),
  password: passwordSchema,
});

export type SignUpValues = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString.max(32, "Username must be at most 32 characters"),
  password: requiredString.max(128, "Password must be at most 128 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString.max(10_000, "Post must be at most 10,000 characters"),
  mediaIds: z
    .array(z.string().trim().min(1).max(128))
    .max(5, "You can only attach up to 5 media items")
    .transform((ids) => [...new Set(ids)]),
});

export const updateUserProfileSchema = z.object({
  displayName: requiredString.max(80, "Display name must be at most 80 characters"),
  bio: z.string().max(1000, "Bio must be at most 1000 characters"),
});

export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>;

export const createCommentSchema = z.object({
  postId: z.string().trim().min(1).max(128),
  content: requiredString.max(2_000, "Comment must be at most 2,000 characters"),
});
