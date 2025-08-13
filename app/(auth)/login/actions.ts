
"use server"

import { lucia } from "@/app/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { verify } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function login(
    credentials: LoginValues,
): Promise<{error: string}> {
    try {
        const{ username, password} = loginSchema.parse(credentials);

        const existingUser = await prisma.user.findFirst({
            where: {
                username: {
                    equals: username,
                    mode: "insensitive",
                },
            }
        });

        if (!existingUser || !existingUser.passwordHash) {
            return { error: "Invalid username or password" };
        }

        const validPassword = await verify(existingUser.passwordHash, password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        if (!validPassword) {
            return { error: "Invalid username or password" };
        }

         const session =await lucia.createSession(existingUser.id, {})
                const sessionCookie = lucia.createSessionCookie(session.id);
                // Define a writable cookies interface to avoid using any
                interface WritableCookies {
                    set(
                        name: string,
                        value: string,
                        options: {
                            path?: string;
                            domain?: string;
                            expires?: Date;
                            httpOnly?: boolean;
                            secure?: boolean;
                            sameSite?: "strict" | "lax" | "none";
                            maxAge?: number;
                        }
                    ): void;
                }
                const cookieStore = cookies() as unknown as WritableCookies;
                cookieStore.set(
                    sessionCookie.name,
                    sessionCookie.value,
                    sessionCookie.attributes,
                );
         return redirect("/home");       

    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error(error);
        return { error: "Something went wrong. Please try again." };
    }
}
