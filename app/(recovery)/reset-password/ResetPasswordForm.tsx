"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { useState, useTransition } from "react";
import { resetPassword } from "./actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await resetPassword(token, password);
      if (result.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PasswordInput
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="New password"
        aria-label="New password"
        required
      />
      {error && <p className="text-destructive text-center">{error}</p>}
      <LoadingButton loading={isPending} type="submit" className="w-full">
        Update password
      </LoadingButton>
    </form>
  );
}
