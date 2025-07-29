import { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";
import Link from "next/link";
import loginImage from "@/public/images/welcome.png";
import GoogleSignInButton from "./GoogleSignInButton";

export const metadata: Metadata = {
  title: " Login",
  description: "Login to your account",
};

export default function Page() {
  return (
    <main className="flex h-screen items-center justify-center p-5">
      <div className="bg-card flex h-full max-h-[40rem] w-full max-w-[64rem] overflow-hidden rounded-2xl shadow-2xl">
        <div className="w-full space-y-10 overflow-y-auto p-10 md:w-1/2">
          <div className="mb-1 flex justify-center">
            <Image
              src="/images/EduLogo.png"
              alt="Logo"
              width={155}
              height={150}
              priority
            />
          </div>
          <h1 className="text-center text-3xl font-bold">Login to EduHive</h1>
          <div className="space-y-5">
            
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
