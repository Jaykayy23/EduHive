import { Metadata } from "next";
import signupImage from "@/public/images/welcome.png";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a new account",
};

export default function Page() {
    return (
        <main className= "flex h-screen items-center justify-center p-5">
            <div className= "flex h-full max-h-[40rem] w-full max-w-[64rem] rounded-2xl overflow-hidden bg-card shadow-2xl">
                <div className="md:w-1/2 w-full space-y-10 overflow-y-auto p-10">
                    <div className="space-y-1 text-center">
                        <div className="mb-1 flex justify-center">
                                <Image
                                  src="/images/EduLogo.png"
                                  alt="Logo"
                                  width={155}
                                  height={150}
                                  priority
                                />
                        </div>
                        <h1 className="text-3xl font-bold">Sign up to EduHive</h1>
                        <p className="text-muted-foreground">
                            Create an account to connect with <span className="italic">learners</span> and <span className="italic">educators </span>
                            worldwide.
                        </p>
                            
                    </div>
                    <div>
                        <SignUpForm />
                        <Link href="/login" className="block text-center hover:underline">
                            Already have an account? Log in
                        </Link>
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