"use client";

import { signUpSchema, SignUpValues } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { signUp } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";
import Link from "next/link";

export default function SignUpForm() {
    const [error, setError] = useState<string>();

    const [isPending, startTransition] = useTransition();

    const form = useForm<SignUpValues> ({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: SignUpValues) {
        setError(undefined);
        startTransition(async () => {
            const {error} = await signUp(values);
            if (error) {
                setError(error);
            }
        })
    }


    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {error && <p className="text-center text-destructive">{error}</p>}
            {error === "Email already taken" && (
              <Link
                href="/verify-email/sent"
                className="block text-center text-sm text-primary hover:underline"
              >
                Need a new verification email?
              </Link>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Password" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton 
            loading={isPending}
            type="submit" className="w-full">
              Create account
            </LoadingButton>
          </form>
        </Form>
      );
    }
