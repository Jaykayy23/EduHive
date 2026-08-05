import ResetPassword from "@/components/emails/ResetPassword"
import { getAppUrl, getEmailFrom, getResendClient } from "./resend"

interface SendPasswordResetEmailOptions {
  email: string
  username: string
  token: string
  tokenHash: string
}

export async function sendPasswordResetEmail({
  email,
  username,
  token,
  tokenHash,
}: SendPasswordResetEmailOptions) {
  const resetUrl = `${getAppUrl()}/reset-password/${encodeURIComponent(token)}`
  const { data, error } = await getResendClient().emails.send(
    {
      from: getEmailFrom(),
      to: email,
      subject: "Reset your EduHive password",
      react: <ResetPassword username={username} resetUrl={resetUrl} />,
    },
    { idempotencyKey: `password-reset-${tokenHash}` },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
