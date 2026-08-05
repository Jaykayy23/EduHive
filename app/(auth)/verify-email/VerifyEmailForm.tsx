"use client"

import LoadingButton from "@/components/LoadingButton"
import { useState, useTransition } from "react"
import { verifyEmail } from "./actions"

export default function VerifyEmailForm({ token }: { token: string }) {
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    startTransition(async () => {
      const result = await verifyEmail(token)
      if (result.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-center text-destructive">{error}</p>}
      <LoadingButton loading={isPending} type="submit" className="w-full">
        Confirm email
      </LoadingButton>
    </form>
  )
}
