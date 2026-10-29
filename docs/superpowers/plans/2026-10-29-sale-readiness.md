# EduHive Sale Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Prepare EduHive for buyer evaluation and handover while retaining both exclusive-sale and source-license options.

**Architecture:** Preserve existing frontend/backend services and protected features. Isolate the public sample demo from authenticated layouts; replace the authentication implementation behind the shared server validation interface; produce documented, reproducible setup and a clean distribution.

**Tech Stack:** Next.js 16.4.3, React 18, TypeScript, PostgreSQL/Prisma 5, Python/FastAPI, Node test runner, existing shadcn components.

**Spec:** `docs/superpowers/specs/2026-10-29-sale-readiness-design.md`

## Global Constraints

- Keep `/hiveq/demo` public and all real data/AI operations authenticated.
- No billing/subscription system, multi-school tenancy, mobile app, feature expansion, or wholesale visual redesign in this scope.
- No real student data in demos, screenshots, archives, or test fixtures.
- Preserve immutable user IDs, usernames, Argon2 password hashes, Google account identity, profile data, preferences, content relationships, admin IDs, and verified/unverified status.
- No production migration, public deployment, account transfer, or commercial license grant.
- Use stable compatible dependencies; no beta release to force compatibility.
- Live provider checks and ownership confirmations remain explicit release gates when unavailable locally.

## Review Focus

- Unauthenticated demo requests must never inherit protected layout redirects or make paid provider requests: Task 1 HTTP smoke and browser checks.
- Empty, partial, and reset quiz answers must score correctly without exposing an answer as correct by default: Task 1 behavior tests.
- Existing Argon2 users and Google identities must migrate idempotently without changing application IDs: Task 3 disposable database integration tests.
- Expired/revoked/unverified sessions must reject protected operations, including password-reset revocation: Task 3 lifecycle tests.
- Nested secret files, symlinks, local caches and generated binaries must not enter distribution: Task 4 archive-manifest tests.

## Task 1: public interactive sample demo

**Files:** create `lib/demo-study.ts`, `components/demo/StudyDemo.tsx`, `app/(public)/hiveq/demo/page.tsx`, `tests/demo-study.test.mjs`; remove `app/(main)/hiveq/demo/page.tsx`; update `tests/hiveq-routing.test.mjs` and `components/landing/LandingPageExperience.tsx`.

**Interfaces:** `DEMO_SAMPLES` contains fixed subject/source/questions; `scoreDemo(questions, answers)` returns correct/answered/total; `createDemoExport(sample, answers)` returns a clearly labeled sample export. Answers keyed by question ID; no network or database dependencies.

- [x] Write and run failing scoring tests for blank answers, case/whitespace normalization, incorrect answers, and sample exports.
- [x] Implement pure demo data/helpers and interactive sample selection, answering, review explanations, reset, and export with existing UI primitives.
- [x] Move the demo outside the protected route group, retain canonical URL, and update obsolete route expectations.
- [x] Strengthen landing copy and include an accurate labeled product sample using the same demo data.
- [x] Run Node demo/routing tests; verify anonymous HTTP access and browser interactions on desktop and mobile-sized viewport.

## Task 2: reproducible build and backend setup

**Files:** modify `app/layout.tsx`, `app/globals.css`, `ml-backend/setup.ps1`; add focused setup verification where useful.

**Interfaces:** Root layout retains current global providers; font stacks resolve locally without build-time requests. Backend interpreter always resolves to `ml-backend/.venv`.

- [x] Remove external font downloads using documented system-font stacks (no asset redistribution needed).
- [x] Anchor Python venv creation and dependency paths to `$PSScriptRoot`, propagate native command failures, and verify paths from root/backend working directories.
- [x] Run production build and backend tests with a reproducible isolated backend environment. Record dependency/network blockers accurately.

## Task 3: maintained authentication and migration

**Files:** `lib/auth/*`, `app/auth.ts`, existing auth routes/actions, auth-related providers/types, `prisma/schema.prisma`, additive migration, `scripts/migrate-auth.*`, `tests/auth-*.test.mjs`, authentication deployment documentation, dependency manifests.

**Interfaces:** Preserve the existing shared `validateRequest()` user/session result consumed by protected routes. Preserve public login/signup/recovery URLs and username login. The implementation may replace the Lucia API internally; client session types must no longer import Lucia.

- [x] Check stable Better Auth compatibility against installed runtime/dependencies using official docs and actual package metadata.
- [x] Write failing behavior tests for password verification, session lifecycle, trusted origins, unverified accounts, and account-migration preservation/idempotency.
- [x] Implement compatible auth integration, shared validation, additive schema and dry-run migration; preserve rate limits and ownership enforcement.
- [x] Run migration/lifecycle integration on an explicitly disposable database only; if unavailable, provide runnable tests and mark this release gate unverified.
- [x] Document new secrets, cutover/re-login, existing token handling, backup and rollback boundaries. Do not run configured production migrations.

## Task 4: buyer handover and clean distribution

**Files:** replace `README.md`; create `docs/buyer/{setup,deployment,operations,costs,transfer,asset-provenance,listing}.md`, `scripts/package-source.mjs`, `tests/package-source.test.mjs`; modify `.gitignore` for release output only as needed.

**Interfaces:** `collectSourceFiles(root)` returns an allowlisted manifest; `package-source.mjs` writes a clean staging folder/manifest for archiving, refusing unsafe output targets. Package-script wiring is integrated by the root implementer after auth dependency changes.

- [x] Write and run failing manifest tests using disposable fixture directories containing nested credentials, symlinks, logs, and generated client artifacts.
- [x] Implement explicit file/directory allowlists and exclusions; fail closed on symlinks, source-tree output, or sensitive artifact names.
- [x] Write complete setup/deploy/operations/transfer instructions consistent with actual code. Cite dated official provider pricing, with usage assumptions instead of invented monthly bills.
- [x] Prepare factual listing, screenshot shot list, walkthrough script and provenance register with unknown rights left unconfirmed.
- [x] Run packaging tests, inspect output manifest, and cross-check commands and environment variables against implementation.

## Task 5: release verification and review

**Files:** add CI configuration, HTTP smoke script, verification matrix/report, release evidence; update audit and this plan.

**Interfaces:** smoke checks require a running local server via explicit base URL; external-provider checks fail or report unverified explicitly when not configured. CI runs credential-free checks and isolated database integration separately.

- [x] Run lint, typecheck, all Node tests, Python tests, Prisma validation and production build with current output.
- [x] Verify anonymous demo and protected route redirects; capture actual sample demo screens and document remaining live user journeys.
- [x] Run an independent whole-change review, address material findings with regression checks, and update graphify with `graphify update .`.
- [x] Deliver reviewable source changes and a release status distinguishing completed repository work from outstanding live deployment/provider/ownership checks.

## Execution rulings and progress

- Owner explicitly requested planning plus implementation in the same turn; proceed without another approval round.
- Existing approved design/audit are uncommitted files and must be preserved.
- Local branch: `codex/sale-readiness`. Creation required sandbox escalation; succeeded. Work stays visible in the shared checkout; no separate worktree is created without a request.
- Independent authentication and handover domains may be delegated under the dispatching-parallel-agents skill; demo/build/integration stay with root. Do not edit the same files concurrently. All changes receive a whole-change review.
- Commits/push/publication are not part of this local delivery; retain reviewable working-tree changes.
- Ruling: the dependency scan uncovered critical Next.js and high validation/transitive advisories, so the implementation includes stable Next.js 16.4.3, Zod 4.6.7/resolver and Tiptap 3.32.1 upgrades plus compatible transitive fixes. Validation/editor behavior tests and a production build cover the changes; if an untested signed-in/provider interaction differs, it must be found in the deployment verification gate.
- Ruling: preserve the current React 18 major rather than add an unrelated React 19 migration. Next.js 16.4.3 supports it but warns about removal in Next.js 17; a future framework upgrade must include that migration.
- Deferred minor: one low-severity deepmerge advisory remains through Stream's media player. Automatic compatible remediation did not resolve it; track upstream rather than silently force an unverified downgrade or Stream major upgrade.
- Evidence: 66 Node tests, 14 Python tests, isolated PostgreSQL migration/lifecycle integration independently repeated, lint/typecheck/Prisma validation and production build passed. All 11 production anonymous smoke checks passed. Actual desktop/mobile screenshots and a verified sample JSON download are recorded in `docs/buyer/verification.md`.
- Independent whole-change reviewer: no material findings; focused suite passed. No production database, live provider account, marketplace listing, or public deployment was modified.
