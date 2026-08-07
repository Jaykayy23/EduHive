import { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";
import Link from "next/link";
import loginImage from "@/public/images/welcome.png";
import GoogleSignInButton from "../GoogleSignInButton";

export const metadata: Metadata = {
  title: " Login",
  description: "Login to your account",
};

interface PageProps {
  searchParams?: Promise<{
    error?: string | string[];
    reset?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const resetMessage = firstValue(params.reset) === "success";
  const oauthError = firstValue(params.error);

  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-0 sm:p-5">
      <div className="bg-card flex min-h-svh w-full max-w-[64rem] overflow-hidden sm:min-h-0 sm:max-h-[40rem] sm:rounded-2xl sm:shadow-2xl">
        <div className="w-full space-y-6 overflow-y-auto px-5 py-8 sm:space-y-8 sm:p-10 md:w-1/2">
          <div className="mb-1 flex justify-center">
            <Image
              src="/images/eduhive-icon.png"
              alt="EduHive"
              width={88}
              height={88}
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
              priority
            />
          </div>
          <h1 className="text-center text-2xl font-bold sm:text-3xl">Login to EduHive</h1>
          <div className="space-y-5">
            {resetMessage && (
              <p className="text-center text-sm text-emerald-600">
                Password updated. You can now log in with your new password.
              </p>
            )}
            {oauthError && (
              <p className="text-center text-sm text-destructive">
                {oauthError === "unverified_google_email"
                  ? "Google could not verify this email address. Please use a verified Google account."
                  : "We could not sign you in with Google. Please try again."}
              </p>
            )}
            <LoginForm />
            <Link href="/signup" className="block text-center hover:underline">
              Don&apos;t have an account? Sign up
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-muted"/>
              <span>OR</span>
              <div className="h-px flex-1 bg-muted"/>
            </div>
            <GoogleSignInButton />
          </div>
        </div>
        <Image
          src={loginImage}
          alt=""
          className="hidden w-1/2 object-cover md:block"
        />
      </div>
    </main>
  );
}
