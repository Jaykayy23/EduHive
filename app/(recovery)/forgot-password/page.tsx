import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = {
  title: "Forgot password",
  description: "Reset your EduHive password",
};

export default function Page() {
  return (
    <main className="from-primary/10 via-background to-background flex min-h-svh items-center justify-center bg-gradient-to-br p-5">
      <div className="bg-card w-full max-w-md space-y-6 rounded-2xl p-8 text-center shadow-2xl">
        <div className="space-y-2">
          <p className="text-primary text-lg font-bold">EduHive</p>
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send a reset link if an account is
            associated with it.
          </p>
        </div>
        <ForgotPasswordForm />
        <Link
          href="/login"
          className="text-primary block text-sm hover:underline"
        >
          Return to login
        </Link>
      </div>
    </main>
  );
}
