
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, BrainCircuit, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { validateRequest } from "./auth"
import { redirect } from "next/navigation"
import Navbar from "./(main)/Navbar"

const features = [
  {
    name: "Interactive Learning Community",
    description: "Engage with a vibrant community of students and educators. Share knowledge, ask questions, and collaborate on projects in a supportive, academic-focused environment.",
    icon: Users,
    href: "/signup",
  },
  {
    name: "AI-Powered Study Tools",
    description:
      "Leverage cutting-edge AI with HiveQ to generate quizzes from your study materials, and chat with EduHive AI for instant academic support and explanations.",
    icon: BrainCircuit,
    href: "/signup",
  },
  {
    name: "Centralized Knowledge Hub",
    description: "Organize your learning with bookmarks, follow topics that matter to you, and build a personalized knowledge base tailored to your academic journey.",
    icon: BookOpen,
    href: "/signup",
  },
]

export default async function LandingPage() {
  const { user } = await validateRequest()

  if (user) {
    redirect("/home")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 sm:py-32">
          <div className="container mx-auto px-6 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                Welcome to the Future of Learning
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Discover, Learn, and Grow with{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">EduHive</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                EduHive is a dynamic social learning platform where students and educators connect, share knowledge, and
                unlock their full academic potential with powerful AI-driven tools.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#8085ff] to-[#474bff] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </section>

        {/* Feature Section */}
        <section className="bg-background py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything You Need to Succeed
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                From collaborative feeds to AI-powered study aids, EduHive provides a comprehensive toolkit for modern
                learners.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col items-start rounded-2xl bg-card p-8 shadow-sm transition-shadow hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold leading-7 text-foreground">{feature.name}</h3>
                  <p className="mt-4 flex-auto text-base leading-7 text-muted-foreground">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="mt-6 text-sm font-semibold leading-6 text-primary hover:text-primary/80"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-primary/5 py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary to-purple-600 px-6 pt-16 text-center shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
              <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to elevate your learning?
                  <br />
                  Start your journey with EduHive today.
                </h2>
                <p className="mt-6 text-lg leading-8 text-purple-100">
                  Join thousands of learners and educators who are transforming the way they study and collaborate.
                  It&apos;s free to get started.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                    <Link href="/signup">Create an Account</Link>
                  </Button>
                  <Button asChild variant="link" size="lg" className="text-white">
                    <Link href="/Demo">
                      View Demo <span aria-hidden="true">→</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative mt-16 h-80 lg:mt-8">
                <Image
                  className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                  src="/images/landing.jpg"
                  alt="App screenshot"
                  data-ai-hint="education dashboard"
                  width={1824}
                  height={1080}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/mylogo.png"
                alt="EduHive Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-lg font-bold">EduHive</span>
            </div>
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} EduHive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
