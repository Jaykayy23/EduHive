import Link from "next/link";
import ResendVerificationForm from "../ResendVerificationForm";

interface PageProps {
  searchParams: Promise<{
    delivery?: string | string[];
    status?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const deliveryFailed = firstValue(params.delivery) === "failed";
  const verificationRequired = firstValue(params.status) === "required";

  return (
    <main className="from-primary/10 via-background to-background flex min-h-svh items-center justify-center bg-gradient-to-br p-5">
      <div className="bg-card w-full max-w-md space-y-6 rounded-2xl p-8 text-center shadow-2xl">
        <div className="space-y-2">
          <p className="text-primary text-lg font-bold">EduHive</p>
          <h1 className="text-2xl font-bold">Check your inbox</h1>
          {verificationRequired ? (
            <p className="text-muted-foreground">
              Your password was correct, but your email still needs to be
              verified before you can enter EduHive.
            </p>
          ) : deliveryFailed ? (
            <p className="text-muted-foreground">
              We could not deliver the verification email yet. Your account is
              still safe and pending verification; try sending it again below.
            </p>
          ) : (
            <p className="text-muted-foreground">
              We sent a verification link to your email address. Confirm it to
              finish setting up your EduHive account.
            </p>
          )}
        </div>

        <ResendVerificationForm />

        <p className="text-muted-foreground text-sm">
          Already verified?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Return to login
          </Link>
        </p>
      </div>
    </main>
  );
}
