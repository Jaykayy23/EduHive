import { Metadata } from "next";
import signupImage from "@/public/images/welcome.png";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import GoogleSignInButton from "../GoogleSignInButton";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a new account",
};

export default function Page() {
    return (
        <main className="flex min-h-svh items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-0 sm:p-5">
            <div className="flex min-h-svh w-full max-w-[64rem] overflow-hidden bg-card sm:min-h-0 sm:max-h-[40rem] sm:rounded-2xl sm:shadow-2xl">
                <div className="w-full space-y-6 overflow-y-auto px-5 py-8 sm:space-y-8 sm:p-10 md:w-1/2">
                    <div className="space-y-1 text-center">
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
                        <h1 className="text-2xl font-bold sm:text-3xl">Sign up to EduHive</h1>
                        <p className="text-muted-foreground">
                            Create an account to connect with <span className="italic">learners</span> and <span className="italic">educators </span>
                            worldwide.
                        </p>
                            
                    </div>
                    <div className="space-y-5">
                        <SignUpForm />
                        <Link href="/login" className="block text-center hover:underline">
                            Already have an account? Log in
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-muted" />
                            <span>OR</span>
                            <div className="h-px flex-1 bg-muted" />
                        </div>
                        <GoogleSignInButton />
                    </div>
                </div>
                <Image
                    src={signupImage}
                    alt=""
                    className="w-1/2 hidden object-cover md:block"
                />
            </div>
        </main>
    )
}
