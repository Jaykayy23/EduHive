import type { Metadata } from "next"
import { redirect } from "next/navigation"

import LandingPageExperience from "@/components/landing/LandingPageExperience"
import { validateRequest } from "./auth"

export const metadata: Metadata = {
  title: "Study together, move forward",
  description:
    "EduHive brings students and educators together to ask questions, share resources, and study with practical AI support.",
}

export default async function LandingPage() {
  const { user } = await validateRequest()

  if (user) {
    redirect("/home")
  }

  return <LandingPageExperience />
}
