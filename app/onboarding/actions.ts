"use server";

import { validateRequest } from "@/app/auth";
import prisma from "@/lib/prisma";
import {
  personalizationSchema,
  type PersonalizationValues,
} from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function savePersonalization(
  values: PersonalizationValues,
): Promise<{ error: string | null }> {
  try {
    const { user } = await validateRequest();
    if (!user) return { error: "Your session expired. Please log in again." };

    const parsed = personalizationSchema.parse(values);

    await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...parsed,
      },
      update: {
        ...parsed,
        completedAt: new Date(),
      },
    });

    revalidatePath("/home");
    redirect("/home");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Unable to save personalization", error);
    return {
      error: "We could not save your preferences. Please try again.",
    };
  }
}
