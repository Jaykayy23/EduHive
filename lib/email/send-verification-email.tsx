import VerifyEmail from "@/components/emails/VerifyEmail"
import { getAppUrl, getEmailFrom, getResendClient } from "./resend"

interface SendVerificationEmailOptions {
  email: string
  username: string
  token: string
  tokenHash: string
}

export async function sendVerificationEmail({
  email,
  username,
  token,
  tokenHash,
}: SendVerificationEmailOptions) {
  const verifyUrl = `${getAppUrl()}/verify-email/${encodeURIComponent(token)}`
  const { data, error } = await getResendClient().emails.send(
    {
      from: getEmailFrom(),
      to: email,
      subject: "Verify your EduHive email",
      react: <VerifyEmail username={username} verifyUrl={verifyUrl} />,
    },
    { idempotencyKey: `verify-email-${tokenHash}` },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}
