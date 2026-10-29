import type { Metadata } from "next";
import StudyDemo from "@/components/demo/StudyDemo";

export const metadata: Metadata = {
  title: "Try HiveQ",
  description:
    "Try a sample study quiz in EduHive. No account, uploads, or AI credits required.",
};

export default function HiveQDemoPage() {
  return <StudyDemo />;
}
