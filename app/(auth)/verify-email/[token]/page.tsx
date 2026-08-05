import { hashAuthToken } from "@/lib/auth/tokens"
import prisma from "@/lib/prisma"
import Link from "next/link"
import VerifyEmailForm from "../VerifyEmailForm"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function Page({ params }: PageProps) {
  const { token } = await params
  const tokenRecord = /^[a-f0-9]{64}$/i.test(token)
    ? await prisma.emailVerificationToken.findUnique({
        where: { tokenHash: hashAuthToken(token) },
      })
    : null
  const isValid = Boolean(tokenRecord && tokenRecord.expiresAt > new Date())

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-5">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 text-center shadow-2xl">
        <p className="text-lg font-bold text-primary">EduHive</p>
        {isValid ? (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Confirm your email</h1>
              <p className="text-muted-foreground">
                Click below to verify your address and enter EduHive.
              </p>
            </div>
            <VerifyEmailForm token={token} />
          </>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Link expired</h1>
            <p className="text-muted-foreground">
              This verification link is invalid, expired, or already used.
              Request a fresh link to continue.
            </p>
            <Link
              href="/verify-email/sent"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
