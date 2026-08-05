"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import {
  ArrowRight,
  Bookmark,
  Bot,
  Check,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const productPromises = [
  {
    title: "Ask people who get it",
    description: "Turn a stuck moment into a useful conversation with students and educators.",
    icon: MessageCircle,
  },
  {
    title: "Study with a thinking partner",
    description: "Use HiveQ and EduHive AI to quiz, explain, and sharpen your understanding.",
    icon: Bot,
  },
  {
    title: "Keep the good stuff",
    description: "Save posts, follow useful voices, and build a resource trail you can return to.",
    icon: Bookmark,
  },
]

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
]

export default function LandingPageExperience() {
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 no-underline hover:no-underline" aria-label="EduHive home">
            <Image
              src="/images/eduhive-icon.png"
              alt=""
              width={38}
              height={38}
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-semibold tracking-[-0.04em]">EduHive</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Main navigation">
            <Link href="#inside" className="hover:text-foreground">Inside EduHive</Link>
            <Link href="#how-it-works" className="hover:text-foreground">How it works</Link>
            <Link href="/Demo" className="hover:text-foreground">View demo</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-xl px-4 shadow-none active:scale-[0.98]">
              <Link href="/signup">Join EduHive</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[calc(100dvh-72px)] border-b border-border/70">
          <div className="mx-auto grid min-h-[calc(100dvh-72px)] max-w-[1400px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[0.92fr_1.08fr] md:gap-12 md:py-12 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reveal}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl"
            >
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Built for how learning actually happens
              </p>
              <h1 className="max-w-[10ch] text-[clamp(3.25rem,7vw,6.7rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
                Study gets better together.
              </h1>
              <p className="mt-6 max-w-[44ch] text-base leading-7 text-muted-foreground sm:text-lg">
                Ask, share, study with AI, and keep moving when the work gets hard.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="rounded-xl px-6 shadow-none active:scale-[0.98]">
                  <Link href="/signup">
                    Join EduHive
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl px-6 active:scale-[0.98]">
                  <Link href="/Demo">View demo</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[420px] overflow-hidden rounded-2xl bg-muted md:min-h-[min(70dvh,760px)]"
            >
              <Image
                src="/images/eduhive-collaboration-hero.png"
                alt="Students working through study material together around a shared table"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 56vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/35 to-transparent p-5 pt-24 text-white sm:p-7">
                <p className="max-w-sm text-lg font-medium leading-snug">
                  One place for the question, the people, and the next useful step.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section aria-labelledby="promise-heading" className="border-b border-border/70">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 id="promise-heading" className="max-w-[12ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Learning should feel alive.
              </h2>
              <p className="mt-5 max-w-[58ch] text-lg leading-8 text-muted-foreground">
                EduHive turns studying from a solo chore into a shared practice with people, tools, and ideas that respond.
              </p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 border-y border-border/70 md:grid-cols-3">
              {productPromises.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.35 }}
                  variants={reveal}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-border/70 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                >
                  <item.icon className="h-6 w-6 text-primary" strokeWidth={1.7} aria-hidden="true" />
                  <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-3 max-w-[34ch] leading-7 text-muted-foreground">{item.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="inside" aria-labelledby="inside-heading" className="scroll-mt-20 border-b border-border/70">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 py-20 sm:px-6 sm:py-28 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-20 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[430px] overflow-hidden rounded-2xl bg-[#eef4ff] dark:bg-primary/10 sm:min-h-[560px]"
            >
              <Image
                src="/images/landing.jpg"
                alt="Illustration of a student using a laptop and notebook"
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
              <h2 id="inside-heading" className="max-w-[11ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                More signal. Less studying alone.
              </h2>
              <p className="mt-6 max-w-[49ch] text-lg leading-8 text-muted-foreground">
                The feed is built around useful questions and resources. AI helps you go deeper, not disappear into another tool.
              </p>
              <ul className="mt-9 grid gap-4" aria-label="What you can do in EduHive">
                {[
                  "Follow people and subjects that match your goals",
                  "Turn study materials into quizzes with HiveQ",
                  "Message peers and educators when a post is not enough",
                  "Bookmark explanations and resources for later",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium sm:text-base">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        <section aria-labelledby="ai-heading" className="border-b border-border/70">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-h-[420px] flex-col justify-between rounded-2xl bg-primary p-7 text-primary-foreground sm:p-10"
            >
              <Sparkles className="h-8 w-8" strokeWidth={1.6} aria-hidden="true" />
              <div>
                <h2 id="ai-heading" className="max-w-[10ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                  AI that keeps you thinking.
                </h2>
                <p className="mt-5 max-w-[38ch] leading-7 text-primary-foreground/85">
                  Get an explanation, generate a quiz, then take the idea back to the people learning beside you.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-[420px] overflow-hidden rounded-2xl bg-[#e7f7f1] dark:bg-primary/10 sm:min-h-[560px]"
            >
              <Image
                src="/images/welcome.png"
                alt="Illustration of a focused digital study space"
                fill
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-contain p-8 sm:p-14"
              />
            </motion.div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="rhythm-heading" className="scroll-mt-20 border-b border-border/70">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={reveal}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 id="rhythm-heading" className="max-w-[13ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
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
                  transition={{ duration: 0.6, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t-2 border-primary pt-6"
                >
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">{item.verb}</h3>
                  <p className="mt-4 max-w-[35ch] leading-7 text-muted-foreground">{item.body}</p>
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
            className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 rounded-2xl bg-primary/10 px-6 py-12 sm:px-10 md:flex-row md:items-end lg:px-14 lg:py-16"
          >
            <div>
              <Users className="h-7 w-7 text-primary" strokeWidth={1.7} aria-hidden="true" />
              <h2 className="mt-7 max-w-[12ch] text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
                Bring your next question.
              </h2>
              <p className="mt-4 max-w-[45ch] leading-7 text-muted-foreground">
                Find the people, explanations, and tools that help you do something useful with it.
              </p>
            </div>
            <Button asChild size="lg" className="rounded-xl px-6 shadow-none active:scale-[0.98]">
              <Link href="/signup">
                Join EduHive
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-foreground">
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
          <Link href="/login" className="font-medium text-foreground">Log in</Link>
        </div>
      </footer>
    </div>
    </MotionConfig>
  )
}
