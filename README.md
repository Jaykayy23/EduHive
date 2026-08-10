This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## EduHive AI tutor setup

The tutor uses NVIDIA Build's OpenAI-compatible API through EduHive's server-side `/api/chatbot` route. Copy `.env.example` to `.env`, then add your NVIDIA key there. Never prefix the key with `NEXT_PUBLIC_` or put it in client-side code.

```env
NVIDIA_API_KEY=your_nvidia_build_api_key
# Optional: defaults to deepseek-ai/deepseek-v4-pro
NVIDIA_MODEL=deepseek-ai/deepseek-v4-pro
# Optional: limits a single tutor response; defaults to 1500
NVIDIA_MAX_TOKENS=1500
# Optional: NVIDIA request timeout in milliseconds; defaults to 55000
NVIDIA_TIMEOUT_MS=55000
```

The route requires an authenticated EduHive user, accepts at most 11 alternating messages of up to 4,000 characters, streams tutor responses as they are generated, times out provider connection attempts, and applies a database-backed request limit shared by every deployment instance.

Students can choose Explain, Quiz Me, Flashcards, Practice Exam, Summarize, Simplify, Compare, or Step-by-Step. The selected mode is validated on the server and saved with the conversation.

## HiveQ setup

HiveQ generation is proxied through authenticated Next.js routes. Configure the
backend URL and the same randomly generated 32+ character key in both services:

```env
# Next.js only
QUESTGEN_API_URL=http://127.0.0.1:8000
HIVEQ_INTERNAL_API_KEY=replace_with_a_long_random_value

# ml-backend only
GEMINI_API_KEY=replace_with_your_gemini_key
HIVEQ_INTERNAL_API_KEY=replace_with_the_same_long_random_value
```

Do not restore `NEXT_PUBLIC_QUESTGEN_API_URL`; it bypasses authentication and
exposes the provider-backed service directly to browsers.

## Transactional authentication email setup

Authentication emails are delivered through Resend, while EduHive stores only hashed verification and reset tokens. Configure a dedicated Resend subdomain such as `auth.eduhive.com`, publish the SPF and DKIM records shown by Resend, and create a send-only API key restricted to that domain.

Add these server-side values to `.env`:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="EduHive <security@auth.eduhive.com>"
APP_URL=http://localhost:3000
```

Keep `RESEND_API_KEY` out of any `NEXT_PUBLIC_` variable. Once the database is reachable, apply additive migrations, including media ownership, with `npm exec prisma migrate deploy`.

Resend references: [domain setup](https://resend.com/docs/dashboard/domains/introduction), [API keys](https://resend.com/docs/dashboard/api-keys/introduction), and [Next.js sending](https://resend.com/docs/send-with-nextjs).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
