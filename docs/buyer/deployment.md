# Deployment

Deploy Next.js, PostgreSQL, and FastAPI separately. These instructions prepare deployment; applying them to a live service requires the owner's authorization. Start with buyer-controlled staging, synthetic accounts, and separate secrets.

## Frontend

1. Provision PostgreSQL with backups/TLS near your Next.js server. Use scoped runtime credentials and a reviewed migration connection. Record the target without logging credentials.
2. Import the repository into your Vercel project, or use a Node host capable of Next.js. Use Node 22 LTS, `npm ci`, `npm run build`, and `npm start` (normally port 3000). Reverse proxy custom hosting with HTTPS. This is a server application, not a static export. Vercel Hobby is personal/non-commercial; choose a commercial plan for a commercial launch ([pricing](https://vercel.com/pricing), checked 2026-10-29).
3. Set all environment variables from [Setup](setup.md), including canonical `APP_URL`, auth secret, database/providers, admin IDs, cron secret, and backend URL/key. Isolate previews from production.
4. Apply reviewed migrations in a separate controlled step with `npx prisma migrate deploy`. Do not run migrations in every serverless startup. Existing databases require [Authentication](authentication.md), a verified backup, and a disposable cutover rehearsal. Never reset production.
5. Deploy, configure canonical domain/TLS and exact OAuth callbacks, and verify email links use that domain. Public environment changes need a rebuild.

## Backend

Root `render.yaml` defines Docker context `./ml-backend`, `/health`, and `ENVIRONMENT=production`. Review its free-plan selection against uptime/resources; a template is not a capacity guarantee.

Create a Render Blueprint from the buyer repository, supply `GEMINI_API_KEY` and new `HIVEQ_INTERNAL_API_KEY`, then set the identical key and resulting HTTPS `QUESTGEN_API_URL` in Next.js. Review parser caps in [Setup](setup.md) and load test with synthetic files. Linux memory/concurrency limits matter even without local ML models.

For another Docker host, from repository root:

```powershell
docker build -t eduhive-hiveq ./ml-backend
docker run --rm -p 8000:8000 --env-file ./ml-backend/.env eduhive-hiveq
```

Use production values in the host secret store, never committed env files or image layers. The container runs as non-root and binds `0.0.0.0:$PORT`. Provide ingress HTTPS. Health is public; production disables API docs. Generation requires the shared key and authenticated Next.js proxy. Never send the key to browsers.

## Scheduled cleanup

`vercel.json` schedules `GET /api/clear-uploads` at `0 2 * * *` (02:00 UTC daily). Configure `CRON_SECRET`; cron authorization must match `Bearer <CRON_SECRET>`. Other hosts need a server-side scheduler with the same header. Keep secrets out of URLs/client code. The existing Vercel Hobby project reports the cron as enabled; its daily execution has a flexible one-hour window.

Test with synthetic unattached uploads first. In production the route deletes unattached media older than 24 hours from UploadThing and then its DB rows. This is destructive, validates UploadThing keys, and is not a backup mechanism. Missing secret returns 503; invalid authorization returns 401. Alert on failed jobs and monitor deleted counts without publishing private URLs. On 2026-10-29, a Vercel-triggered run logged HTTP 200; anonymous and invalid-bearer requests returned 401. A controlled production test deleted one 48-hour-old orphan, retained a fresh upload, and then explicitly cleaned the remaining synthetic fixture. This does not prove a future unattended run or configure alert delivery.

## Release acceptance

Run lint/typecheck/unit/build/backend checks and disposable migration tests before promotion. Verify landing/demo anonymously, protected rejection, signup/email/Google login, verification, recovery/logout/revocation, onboarding, posts/comments/bookmarks, upload callbacks, HiveQ text/file inputs, tutor modes, messaging, and moderation with authorized synthetic users. Check desktop/mobile viewports and actual buyer provider accounts.

Record release manifest/commit, runtimes, redacted variable names, migration version, hostname, time, results, and approver. A local build or health endpoint does not verify provider journeys. Keep live deployment/provider checks, restore rehearsal and rights confirmation as release gates until evidenced. See [Transfer](transfer.md).
