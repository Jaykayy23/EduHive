"use client";

import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    startTransition(async () => {
      await requestPasswordReset(email);
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-muted-foreground text-sm">
          If an account exists for that email, we sent a password reset link.
        </p>
        <p className="text-muted-foreground text-xs">
          Check your inbox and spam folder. The link expires in 30 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        required
      />
      <LoadingButton loading={isPending} type="submit" className="w-full">
        Send reset link
      </LoadingButton>
    </form>
  );
}
