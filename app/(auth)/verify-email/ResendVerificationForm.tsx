"use client";

import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { resendVerificationEmail } from "./actions";

export default function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSent(false);
    startTransition(async () => {
      const result = await resendVerificationEmail(email);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        required
      />
      {error && <p className="text-destructive text-center">{error}</p>}
      {sent && (
        <p className="text-center text-sm text-emerald-600">
          If the account is eligible, a new verification email is on its way.
        </p>
      )}
      <LoadingButton loading={isPending} type="submit" className="w-full">
        Resend verification email
      </LoadingButton>
    </form>
  );
}
