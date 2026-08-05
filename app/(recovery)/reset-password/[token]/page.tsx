import { hashAuthToken } from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ResetPasswordForm from "../ResetPasswordForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const tokenRecord = /^[a-f0-9]{64}$/i.test(token)
    ? await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashAuthToken(token) },
      })
    : null;
  const isValid = Boolean(tokenRecord && tokenRecord.expiresAt > new Date());

  return (
    <main className="from-primary/10 via-background to-background flex min-h-svh items-center justify-center bg-gradient-to-br p-5">
      <div className="bg-card w-full max-w-md space-y-6 rounded-2xl p-8 text-center shadow-2xl">
        <p className="text-primary text-lg font-bold">EduHive</p>
        {isValid ? (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Choose a new password</h1>
              <p className="text-muted-foreground">
                Your password will be updated and all existing sessions will be
                signed out.
              </p>
            </div>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Link expired</h1>
            <p className="text-muted-foreground">
              This password reset link is invalid, expired, or already used.
            </p>
            <Link
              href="/forgot-password"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center rounded-md px-4 py-2 font-medium"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
