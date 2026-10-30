# Operations and recovery

Operate frontend, PostgreSQL, FastAPI, email, chat and storage as separate dependencies. Record each owner, region, account, renewal, quota alert, and incident contact privately. Keep all evidence free of student data and secret values.

## Routine checks

- Watch frontend errors/latency, failed sign-ins, database connection count/storage, and backend `/health` plus generation error rates. Health alone does not verify the model. Use low-volume synthetic requests with cost alerts for provider probes.
- Watch Gemini/NVIDIA quotas, email delivery/bounces, Stream connections/MAU, UploadThing storage, and daily cleanup outcomes. HTTP 429 should cause a bounded retry after the returned wait, not client retry loops.
- Review moderation reports with explicitly allowlisted immutable `ADMIN_USER_IDS`. Remove departed admins and test denied access. Changing a username must not change admin identity.
- Confirm daily backups succeeded, verify checksums, rehearse restore regularly, and review retention/access. Never paste tokens, hashes, email addresses, document content or private URLs into support logs.

Database-backed rate-limit buckets are shared across frontend instances in `AuthEmailRateLimit`. Tutor's application policy is 12 requests/user/minute (`lib/tutor-rate-limit.ts`); other endpoints use their own policies in source. Provider limits and parser concurrency apply in addition. Trust forwarded IP headers only behind your host's trusted ingress; strip spoofed headers at a custom proxy. Do not solve a 429 by removing enforcement. Old buckets/sessions/tokens need an explicit retention policy; there is no documented universal retention-cleanup scheduler here.

## Backup

Define recovery objectives before accepting users: how much data loss is acceptable (RPO), recovery time (RTO), backup cadence/retention, offsite location, encryption and access reviewers. Use database-provider point-in-time recovery where available plus encrypted logical backups. A local dump alone is not a full service backup.

Use PostgreSQL client tools matching the server's supported version. Put connection credentials in a protected `.pgpass`/`PGPASSFILE` or secret-injected `PG*` environment, outside the source tree. Do not embed passwords in commands. Example with a password prompt, replacing host/user/database values:

```powershell
# Put this outside the repository and release folder, on a protected backup volume.
pg_dump --host=YOUR_DB_HOST --username=YOUR_BACKUP_USER --dbname=eduhive --password --format=custom --file=C:/secure-backups/eduhive-before-cutover.dump
if ($LASTEXITCODE -ne 0) { throw 'Database backup failed' }
pg_restore --list C:/secure-backups/eduhive-before-cutover.dump
if ($LASTEXITCODE -ne 0) { throw 'Backup archive cannot be read' }
Get-FileHash C:/secure-backups/eduhive-before-cutover.dump -Algorithm SHA256
```

Use your provider's required TLS configuration (for example trusted root certificate and `PGSSLMODE=verify-full`). Encrypt and copy the dump offsite, restrict access, and store its checksum separately. Listing an archive does not establish recoverability: restore it to a new isolated DB. Back up provider-managed uploads and chat history separately using permitted export features; the database stores references, not all underlying files/messages. Record object inventory/keys, export time, application release, migration state, secret-store references and DNS/host configuration. Never put dumps or exports into the source package.

## Current seller recovery coverage (verified 2026-10-29)

The owner chose to retain the existing free plan and disclose its limits. Neon reports a rolling **1-day point-in-time recovery window** for the production branch. One manual snapshot was created on **2026-10-29 at 14:37:09 UTC**, with no expiration shown. This is a fixed snapshot: later writes are not added to it. Scheduled snapshots require an upgrade and are **not enabled**. No paid plan or external backup destination was added.

A multi-step snapshot restore created a separate rehearsal branch without changing production connections. Read-only counts matched production: 11 users, 22 posts, 12 auth accounts and 6 completed migrations. The earlier logical-dump restore also passed in isolated local PostgreSQL. These checks verify recovery at those points; they do not establish a measured end-to-end disaster-recovery RTO or guarantee a zero-loss RPO.

Buyer disclosure: this is short-window database recovery plus one fixed manual snapshot, **not automated daily retained backups**. It does not independently back up UploadThing objects or Stream messages. The private local cutover dump is not a managed offsite backup and is excluded from the sale archive. Before accepting important customer data, the operator should choose longer retention, independent encrypted storage and provider-object/chat exports appropriate to its recovery objectives. Monitor the recovery window and snapshot status; take a fresh checkpoint before risky changes rather than deleting the existing snapshot without a replacement plan.

## Restore rehearsal

Create an empty disposable PostgreSQL DB `eduhive_restore_check` on an isolated server, with no application traffic. Verify the target and choose a restricted test role. The following targets the new database and does not drop tables:

```powershell
pg_restore --host=YOUR_ISOLATED_HOST --username=YOUR_TEST_USER --dbname=eduhive_restore_check --password --no-owner --no-privileges --exit-on-error C:/secure-backups/eduhive-before-cutover.dump
if ($LASTEXITCODE -ne 0) { throw 'Restore rehearsal failed' }
```

Use an isolated application environment and disable outbound email/cron/provider writes while inspecting restored sensitive data; prefer a sanitized dataset for repeatable tests. Set its `DATABASE_URL` explicitly, run `npx prisma migrate status`, and compare schema/migration state and approved record counts. Rehearse auth migration as documented in [Authentication](authentication.md), then verify login/relationships/ownership against controlled accounts. Restore upload/chat exports to separate test apps where provider capabilities permit; missing objects and old URLs are a separate recovery failure. Measure elapsed recovery time and record results privately. Destroy disposable restored personal data according to the agreed policy, after confirming its target.

An actual disaster restore requires a maintenance window, traffic/writes paused, incident-owner approval, chosen recovery point, restored DB and external objects, secret rotation where warranted, and staged validation before DNS/traffic switching. Do not run restore commands against a functioning production database as a diagnostic.

## Updates and rollback

Pin a release and retain its manifest/lockfiles. Test dependency updates on a branch with `npm ci`, backend pinned requirements, lint, typecheck, Node/backend tests, schema validation and production build. Read installed Next.js guides before framework changes. Rehearse migrations on disposable PostgreSQL, compare provider SDK changes, and verify synthetic workflows in staging. Schedule production migration separately from the build.

Back up before schema/auth cutover. Code rollback is safe only when the older code understands the current schema/data. An additive migration does not guarantee semantic rollback after new auth writes; follow the authentication runbook's boundary. Restoring an earlier DB loses intervening writes and may leave storage/chat out of sync. Keep the prior deployment available, document the decision maker and acceptable recovery point, and never automatically reverse schema or reset the DB.

## Troubleshooting

| Symptom                         | Checks and response                                                                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public demo redirects to login  | Check deployment's route tree/release; `/hiveq/demo` must be outside the protected main layout. Do not disable auth on main routes.                                                             |
| DB connection/schema error      | Check target/TLS, pool limits, credentials, `npx prisma migrate status`, generated Prisma client, and DB availability. Do not run reset.                                                        |
| Login/callback fails            | Check canonical `APP_URL`, exact registered redirect, trusted origin, auth secret consistency, cookie HTTPS, verified status, and migration counts. Follow [Authentication](authentication.md). |
| Verification/reset not received | Check verified sender/DNS, Resend permissions/quota/bounces and canonical link origin. Use resend/recovery workflow; never manually mark arbitrary users verified to unblock a demo.            |
| HiveQ unauthorized/unavailable  | Check identical 32+ character internal keys, frontend server URL/HTTPS, backend production config and logs. Health can pass while Gemini key/quota/model fails.                                 |
| File rejected/timeouts          | Check actual PDF/DOCX/text input, size/page/archive limits, parser memory/concurrency, host memory and model timeout. Test smaller synthetic files first.                                       |
| Tutor fails or stalls           | Check NVIDIA account/model/quota, server-only key, timeout below host budget, bounded response size and streaming ingress. Avoid automatic paid retries.                                        |
| Chat or upload fails            | Check correct matching Stream app credentials or UploadThing token, permissions and callback host; a new app will not supply historical data.                                                   |
| Admin denied                    | Check immutable ID in `ADMIN_USER_IDS` and restart/redeploy; blank intentionally denies access.                                                                                                 |
| Cleanup fails                   | Check cron authorization/status, UploadThing key extraction and deletion outcome; storage deletion precedes DB row removal. Investigate before retrying repeatedly.                             |

For a leaked credential revoke/rotate it in the provider first, update all dependent environments, redeploy/rebuild as needed, review access logs, and follow the incident notification obligations agreed by the owner. Frontend/backend HiveQ key rotation must be coordinated. Source distribution is not a secret-revocation mechanism.


## Observed Render service limits - 2026-10-30

The existing EduHive Docker service is on Render Free: one instance, 0.1 CPU and 512 MB RAM. Render warns that waking after inactivity may delay requests by 50 seconds or more. The application's 55-second HiveQ proxy timeout can therefore leave little time for parsing and generation on a cold request. A warm successful quiz does not establish cold-start reliability. Disclose this to evaluators and rehearse cold-start behavior before promising an availability or latency target. No paid upgrade was made.

The deployed `/health` endpoint returned healthy version 2.0.0. Render's Health Check Path was initially blank. With explicit owner approval it was set to `/health`; the triggered deployment succeeded, with repeated HTTP 200 health checks in Render logs. The repository Blueprint already specifies that path, but an existing manually configured service does not automatically inherit it. Health does not exercise Gemini, authentication or PostgreSQL.

Source HiveQ limits are 10 requests per user and 30 per IP in ten minutes, shared through PostgreSQL. Parser defaults are 15 seconds, 256 MB and two concurrent parsers per instance. Confirm deployed overrides and provider-side quotas/budget alerts separately; application rate limiting is not a monetary spending cap.

Render workspace usage also showed included monthly limits of 750 free instance hours, 5 GB bandwidth and 500 pipeline minutes. These are workspace-wide limits observed on 2026-10-30, not a buyer entitlement or a Gemini/NVIDIA spending cap. The production documentation endpoint returned HTTP 404 in the read-only probe.


## Observed Gemini controls and unresolved warning - 2026-10-30

Google AI Studio's owner project named Eduhive displayed Free tier, Gemini 2.5 Flash quotas of 5 RPM / 250,000 TPM / 20 RPD, and an existing experimental $100 monthly spend cap. The UI warns that cap overages may occur during about ten minutes of processing delay. No budget was edited, credit purchased, billing account linked or plan upgraded. These observations do not independently match the deployed hidden key to the project.

The provider also reports depleted prepay credits and asks for credits to resume service. Resolve that account/project state and recheck a small controlled quiz before describing live generation as currently ready. Do not infer availability from process `/health`, the public fixed sample, or a prior day's successful provider call. NVIDIA account controls are still unverified because its sign-in flow did not open; the owner was asked to sign in manually.
