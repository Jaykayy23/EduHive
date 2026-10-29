import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEMO_SAMPLES } from "@/lib/demo-study";

export default function StudyPreview() {
  const sample = DEMO_SAMPLES[0];
  const question = sample.questions[0];
  return (
    <div className="flex flex-col gap-5 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <BookOpen className="text-primary size-5" />
          HiveQ study session
        </span>
        <Badge variant="outline">Fixed sample</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardDescription>YOUR MATERIAL</CardDescription>
          <CardTitle>Cell biology, one idea at a time.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-7">
            {sample.source.split(". ").slice(0, 2).join(". ")}.
          </p>
        </CardContent>
      </Card>
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-xs font-medium">
        <span className="bg-border h-px flex-1" />
        From reading to remembering
        <span className="bg-border h-px flex-1" />
      </div>
      <Card>
        <CardHeader>
          <CardDescription>MULTIPLE CHOICE · 1 OF 3</CardDescription>
          <CardTitle>{question.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-sm">
            <Check className="text-primary size-4 shrink-0" />
            {question.answer}
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            {question.explanation}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/hiveq/demo">
              Try the quiz yourself
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      <p className="text-muted-foreground text-center text-xs leading-5">
        A real sample from the demo. No account or AI credits needed.
      </p>
    </div>
  );
}
