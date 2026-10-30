"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  Bot,
  Check,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import StudyPreview from "./StudyPreview";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const productPromises = [
  {
    title: "Ask people who get it",
    description:
      "Turn a stuck moment into a useful conversation with students and educators.",
    icon: MessageCircle,
  },
  {
    title: "Study with a thinking partner",
    description:
      "Use HiveQ and EduHive AI to quiz, explain, and sharpen your understanding.",
    icon: Bot,
  },
  {
    title: "Keep the good stuff",
    description:
      "Save posts, follow useful voices, and build a resource trail you can return to.",
    icon: Bookmark,
  },
];

const rhythm = [
  {
    verb: "Bring the question",
    body: "Post the problem, idea, or resource that deserves more than another lonely browser tab.",
  },
  {
    verb: "Work it through",
    body: "Learn from the community, test your recall with AI, and compare different ways to solve it.",
  },
  {
    verb: "Carry it forward",
    body: "Save what clicked, follow the right people, and return with a stronger point of view.",
  },
];

export default function LandingPageExperience() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background text-foreground min-h-[100dvh] overflow-x-clip">
        <header className="border-border/70 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-3 no-underline hover:no-underline"
              aria-label="EduHive home"
            >
              <Image
                src="/images/eduhive-icon.png"
                alt=""
                width={38}
                height={38}
                className="h-9 w-9 object-contain"
              />
              <span className="text-lg font-semibold tracking-[-0.04em]">
                EduHive
              </span>
            </Link>

            <nav
              className="text-muted-foreground hidden items-center gap-7 text-sm font-medium md:flex"
              aria-label="Main navigation"
            >
              <Link href="#inside" className="hover:text-foreground">
                Inside EduHive
              </Link>
              <Link href="#how-it-works" className="hover:text-foreground">
                How it works
              </Link>
              <Link href="/hiveq/demo" className="hover:text-foreground">
                View demo
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="rounded-xl px-4 shadow-none active:scale-[0.98]"
              >
                <Link href="/signup">Join EduHive</Link>
              </Button>
            </div>
          </div>
        </header>

        <main>
          <section className="border-border/70 relative min-h-[calc(100dvh-72px)] border-b">
            <div className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-[1400px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.92fr_1.08fr] md:gap-12 md:py-12 lg:px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={reveal}
                transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl"
              >
                <p className="text-primary mb-5 text-xs font-semibold tracking-[0.18em] uppercase">
                  Your material. More ways to understand it.
                </p>
                <h1 className="max-w-[10ch] text-[clamp(3.25rem,7vw,6.7rem)] leading-[0.9] font-semibold tracking-[-0.07em]">
                  Turn notes into knowledge.
                </h1>
                <p className="text-muted-foreground mt-6 max-w-[44ch] text-base leading-7 sm:text-lg">
                  Turn your notes into quizzes with HiveQ, work through ideas
                  with an AI tutor, and find people to learn alongside.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-6 shadow-none active:scale-[0.98]"
                  >
                    <Link href="/hiveq/demo">
                      Try a sample quiz
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-6 active:scale-[0.98]"
                  >
                    <Link href="/signup">Create an account</Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-muted/60 relative overflow-hidden rounded-2xl border"
              >
                <StudyPreview />
              </motion.div>
            </div>
          </section>

          <section
            aria-labelledby="promise-heading"
            className="border-border/70 border-b"
          >
            <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2
                  id="promise-heading"
                  className="max-w-[12ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl"
                >
                  Learning should feel alive.
                </h2>
                <p className="text-muted-foreground mt-5 max-w-[58ch] text-lg leading-8">
                  EduHive turns studying from a solo chore into a shared
                  practice with people, tools, and ideas that respond.
                </p>
              </motion.div>

              <div className="border-border/70 mt-14 grid grid-cols-1 border-y md:grid-cols-3">
                {productPromises.map((item, index) => (
                  <motion.article
                    key={item.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.35 }}
                    variants={reveal}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border-border/70 border-b py-8 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                  >
                    <item.icon
                      className="text-primary h-6 w-6"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em]">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 max-w-[34ch] leading-7">
                      {item.description}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="inside"
            aria-labelledby="inside-heading"
            className="border-border/70 scroll-mt-20 border-b"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-20 lg:px-8">
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="dark:bg-primary/10 relative min-h-[430px] overflow-hidden rounded-2xl bg-[#eef4ff] sm:min-h-[560px]"
              >
                <Image
                  src="/images/study-workspace.svg"
                  alt="Original illustration of notes, a recall card and a progress chart"
                  fill
                  sizes="(max-width: 767px) 100vw, 55vw"
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2
                  id="inside-heading"
                  className="max-w-[11ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl"
                >
                  More signal. Less studying alone.
                </h2>
                <p className="text-muted-foreground mt-6 max-w-[49ch] text-lg leading-8">
                  The feed is built around useful questions and resources. AI
                  helps you go deeper, not disappear into another tool.
                </p>
                <ul
                  className="mt-9 grid gap-4"
                  aria-label="What you can do in EduHive"
                >
                  {[
                    "Follow people and subjects that match your goals",
                    "Turn study materials into quizzes with HiveQ",
                    "Message peers and educators when a post is not enough",
                    "Bookmark explanations and resources for later",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm font-medium sm:text-base"
                    >
                      <span className="bg-primary/10 text-primary mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg">
                        <Check
                          className="h-4 w-4"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>

          <section
            aria-labelledby="ai-heading"
            className="border-border/70 border-b"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={reveal}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="bg-primary text-primary-foreground flex min-h-[420px] flex-col justify-between rounded-2xl p-7 sm:p-10"
              >
                <Sparkles
                  className="h-8 w-8"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <div>
                  <h2
                    id="ai-heading"
                    className="max-w-[10ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl"
                  >
                    AI that keeps you thinking.
                  </h2>
                  <p className="text-primary-foreground/85 mt-5 max-w-[38ch] leading-7">
                    Get an explanation, generate a quiz, then take the idea back
                    to the people learning beside you.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.7,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="dark:bg-primary/10 relative min-h-[420px] overflow-hidden rounded-2xl bg-[#e7f7f1] sm:min-h-[560px]"
              >
                <Image
                  src="/images/study-workspace.svg"
                  alt="Illustration of a focused digital study space"
                  fill
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  className="object-contain p-8 sm:p-14"
                />
              </motion.div>
            </div>
          </section>

          <section
            id="how-it-works"
            aria-labelledby="rhythm-heading"
            className="border-border/70 scroll-mt-20 border-b"
          >
            <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={reveal}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2
                  id="rhythm-heading"
                  className="max-w-[13ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl"
                >
                  A better rhythm for learning.
                </h2>
              </motion.div>

              <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
                {rhythm.map((item, index) => (
                  <motion.article
                    key={item.verb}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={reveal}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.09,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="border-primary border-t-2 pt-6"
                  >
                    <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                      {item.verb}
                    </h3>
                    <p className="text-muted-foreground mt-4 max-w-[35ch] leading-7">
                      {item.body}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="bg-primary/10 mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 rounded-2xl px-6 py-12 sm:px-10 md:flex-row md:items-end lg:px-14 lg:py-16"
            >
              <div>
                <Users
                  className="text-primary h-7 w-7"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <h2 className="mt-7 max-w-[12ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  Bring your next question.
                </h2>
                <p className="text-muted-foreground mt-4 max-w-[45ch] leading-7">
                  Find the people, explanations, and tools that help you do
                  something useful with it.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="rounded-xl px-6 shadow-none active:scale-[0.98]"
              >
                <Link href="/signup">
                  Join EduHive
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </section>
        </main>

        <footer className="border-border/70 border-t">
          <div className="text-muted-foreground mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="text-foreground flex items-center gap-3">
              <Image
                src="/images/eduhive-icon.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-semibold">EduHive</span>
            </div>
            <p>Built for curious people who learn better together.</p>
            <Link href="/login" className="text-foreground font-medium">
              Log in
            </Link>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
