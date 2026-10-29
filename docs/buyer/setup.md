# Setup and configuration

Use a fresh checkout or staged source copy and development accounts. Commands use PowerShell from the repository root unless indicated. Do not copy the seller's `.env` or production data. Network access is needed for dependency installation and providers; fixed samples make no provider requests.

## Runtimes and database

- Node.js 22 LTS, version 22.14 or newer, with npm. The application engine minimum is 20.9, but the test runner also needs Node type-stripping flags.
- Python 3.12 (backend minimum 3.10), PostgreSQL and its command-line tools; Docker is optional.
- Use the npm lockfile and pinned `ml-backend/requirements.txt`. No local ML model download is required.

Create a new development database/login with your administrator. For example, in `psql` as a local administrator:

```sql
CREATE ROLE eduhive_dev LOGIN;
\password eduhive_dev
CREATE DATABASE eduhive_dev OWNER eduhive_dev;
```

Use the password prompt rather than shell history. Set `DATABASE_URL` to the resulting URL and URL-encode reserved credential characters. Remote databases require the provider's TLS settings. Choose a region near the frontend and budget connection pooling for serverless instances. SQLite is not a substitute for PostgreSQL.

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Edit .env; Prisma reads this root file. Confirm the database target first.
npx prisma validate
npx prisma migrate deploy
npx prisma generate
```

`migrate deploy` applies committed migrations to `DATABASE_URL`. A new database does not need legacy account backfill. For an existing database, stop here and follow [Authentication](authentication.md); never use `migrate reset` or `db push` on a live database. No student dataset or demo seed is required. `scripts/seed-achievements.ts` contains optional achievement definitions; inspect it before using a separately configured TypeScript runner. It is not a first-run requirement.

## Frontend environment

Only `NEXT_PUBLIC_STREAM_KEY` is a public provider key. Keep all other credentials server-side. Example values are placeholders. Generate separate random secrets with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; store output securely, never in a release archive.

| Variable                                   | Configuration / feature                                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                             | PostgreSQL URL for accounts, content, sessions and shared rate limits.                                                                                                            |
| `APP_URL`                                  | Exact browser origin: initially `http://localhost:3000`, then canonical HTTPS domain. Used in email links and auth configuration.                                                 |
| `BETTER_AUTH_URL`                          | Exact canonical authentication origin; set equal to `APP_URL`, including localhost port for development.                                                                          |
| `BETTER_AUTH_SECRET`                       | Independent random 32+ character signing secret; see [Authentication](authentication.md) for cutover settings.                                                                    |
| `AUTH_TRUSTED_ORIGINS`                     | Optional comma-separated exact additional origins; production requires HTTPS. Do not use wildcards or arbitrary user-supplied origins.                                            |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth web client from buyer's Google Cloud project, for Google login.                                                                                                             |
| `RESEND_API_KEY`                           | Send-only domain-restricted key from buyer's Resend account, for verification/recovery.                                                                                           |
| `EMAIL_FROM`                               | Verified sender such as `EduHive <security@auth.example.com>`; replace example domain.                                                                                            |
| `NEXT_PUBLIC_STREAM_KEY`, `STREAM_SECRET`  | Matching public app key/private server secret from buyer's Stream Chat app. Accounts/chat paths may initialize Stream; use a real development app for authenticated walkthroughs. |
| `UPLOADTHING_TOKEN`                        | Buyer UploadThing app token, for avatars/post attachments/cleanup.                                                                                                                |
| `NVIDIA_API_KEY`                           | Buyer NVIDIA Build credential, for tutor inference.                                                                                                                               |
| `NVIDIA_MODEL`                             | Optional, default `nvidia/nemotron-3.5-bolt-e4b`; confirm availability/terms.                                                                                                      |
| `NVIDIA_MAX_TOKENS`                        | Optional tutor response cap, example `1500`.                                                                                                                                      |
| `NVIDIA_TIMEOUT_MS`                        | Optional, example `55000`, below the route's 60-second execution budget.                                                                                                          |
| `QUESTGEN_API_URL`                         | Server-to-server backend origin, initially `http://127.0.0.1:8000`; production uses HTTPS.                                                                                        |
| `HIVEQ_INTERNAL_API_KEY`                   | Shared random 32+ character secret, identical in frontend/backend. Never use a public prefix.                                                                                     |
| `ADMIN_USER_IDS`                           | Comma-separated immutable application IDs; empty denies moderation. Not emails/usernames.                                                                                         |
| `CRON_SECRET`                              | Independent random secret protecting `GET /api/clear-uploads`.                                                                                                                    |

`NEXT_PUBLIC_BASE_URL` is a legacy email URL fallback; prefer `APP_URL` and keep any fallback identical. Next.js manages `NODE_ENV`. Public variable changes require a rebuild. Keep production keys out of previews.

## Provider registration

1. Google Cloud: create a Web application OAuth client, configure consent/test users, and register `http://localhost:3000/api/auth/callback/google` locally and `https://YOUR_DOMAIN/api/auth/callback/google` for deployment. The existing Arctic callback path is retained; see [Authentication](authentication.md). Register origins separately; no wildcard callback. Re-test after hostname changes.
2. Resend: add a domain/subdomain you control, publish the exact SPF/DKIM records from its dashboard, wait for verification, and configure your DMARC policy. Set `EMAIL_FROM` on that domain. Sandbox recipient access does not prove production delivery; test verification/recovery to a controlled inbox, including spam placement.
3. Stream: create a Chat app, pair its key/secret, keep server authentication enabled. Application IDs identify Stream users. A fresh app does not automatically carry over chat history.
4. UploadThing: create an app/token and configure deployed callback settings as required by its dashboard. Upload a synthetic image, verify callback/persistence/cleanup. Changing storage apps does not rewrite stored URLs.
5. Google AI Studio: obtain a Gemini key for the backend. NVIDIA Build: obtain a separate tutor key. Review data handling, model availability, quotas and commercial terms before sending student material.

The landing page and `/hiveq/demo` provide evaluation without paid calls. Fixed samples do not imply that every authenticated page initializes without service configuration.

## Backend

```powershell
if (-not (Test-Path ml-backend/.env)) { Copy-Item ml-backend/.env.example ml-backend/.env }
# Edit backend .env; use the identical HIVEQ_INTERNAL_API_KEY as the frontend.
& ./ml-backend/setup.ps1
Push-Location ml-backend
try {
  & ./.venv/Scripts/python.exe -m unittest discover -s tests -v
  & ./.venv/Scripts/python.exe -m uvicorn app.main:app --reload --env-file .env --port 8000
} finally { Pop-Location }
```

Keep that terminal running; use another for `npm run dev`. On Linux/macOS, from `ml-backend`: `python3.12 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, then `.venv/bin/python -m uvicorn app.main:app --env-file .env --port 8000`. The Docker image also uses Python 3.12.

| Backend variable             | Default / purpose                                                         |
| ---------------------------- | ------------------------------------------------------------------------- |
| `GEMINI_API_KEY`             | Required for generation; health can pass without it.                      |
| `GEMINI_MODEL`               | `gemini-2.5-flash`; confirm access with your account.                     |
| `HIVEQ_INTERNAL_API_KEY`     | Same 32+ character secret as Next.js; internal generation authentication. |
| `ENVIRONMENT`                | `development`; set `production` to disable API docs endpoints.            |
| `MAX_UPLOAD_MB`              | `10`; in-memory upload cap.                                               |
| `MAX_CONTEXT_CHARS`          | `60000`; extracted context limit.                                         |
| `MAX_PDF_PAGES`              | `100`; input page cap.                                                    |
| `MAX_DOCX_ENTRIES`           | `1000`; DOCX archive-entry cap.                                           |
| `MAX_DOCX_UNCOMPRESSED_MB`   | `40`; expanded DOCX cap.                                                  |
| `FILE_PARSE_TIMEOUT_SECONDS` | `15`; parser wall-clock cap.                                              |
| `FILE_PARSE_MEMORY_LIMIT_MB` | `256`; Linux parser address-space cap.                                    |
| `MAX_CONCURRENT_FILE_PARSES` | `2`; per-instance parsing concurrency.                                    |
| `SUMMARY_MAX_WORDS`          | `3500`; local extractive-summary target.                                  |
| `PORT`                       | `8000`; Docker honors it; set local uvicorn port explicitly.              |

## Acceptance and administrator

Open `http://localhost:8000/health`, then `http://localhost:3000/` and `/hiveq/demo`. Health proves process readiness, not AI access. Score blank/partial quizzes, review explanations, reset/export. Visit a protected route signed out and confirm rejection. Create a synthetic account, verify email, log in, complete onboarding, create a sample post/quiz, and exercise tutor/chat/upload with development credentials.

For moderation, inspect the verified synthetic account's immutable `id` with `npx prisma studio` on the development DB; set that exact ID in `ADMIN_USER_IDS`, restart, test `/admin/reports`, and confirm another user is denied. Never expose Studio publicly or publish screenshots with real records.

Record runtime versions and outcomes of `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate`, `npm run build`, and backend unittest discovery. Follow disposable migration tests in [Authentication](authentication.md). Mark missing network/credentials/provider checks unverified.

## Existing-account cutover

Back up and rehearse first. The explicit migration script uses `AUTH_MIGRATION_DATABASE_URL`, deliberately ignoring the normal `DATABASE_URL`; configure it only for the intended rehearsal/cutover target. `npm run auth:migrate -- --dry-run` reports counts without writes; `npm run auth:migrate -- --apply` performs the idempotent account backfill after the additive schema migrations. Do not point this at production during evaluation. Old sessions are rejected at cutover, so existing users sign in again; bounded-lifetime existing verification/reset tokens remain supported. Full validation and rollback boundaries are in [Authentication](authentication.md).
