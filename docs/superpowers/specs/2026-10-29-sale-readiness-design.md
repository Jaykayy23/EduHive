# EduHive sale-readiness design

Status: approved by the owner on 2026-10-29, with instructions to write the implementation plan and carry out the improvements. Sales direction confirmed: keep both an exclusive project sale and repeatable source-code licensing available.

## Intent

Make the existing EduHive product easy to evaluate, install, operate, and transfer. A buyer should see actual study workflows, understand service dependencies and costs, and receive honest evidence about what has been verified. Sale readiness does not imply proven demand, guaranteed marketplace acceptance, or a particular valuation.

## Approaches

1. Listing preparation only: public demo, presentation, and documentation. Smaller scope but leaves technical maintenance and reliability concerns.
2. Full sale preparation: the same buyer-facing work plus reproducible builds, authentication modernization, and core workflow verification. Recommended by the implementer; the owner's reply confirmed keeping both sales options open, not yet this entire implementation scope.
3. Commercial expansion: billing, subscriptions, and customer management. Deferred because it creates a new product scope rather than preparing the existing asset.

This design proposes approach 2, delivered in independently verifiable phases. It retains the existing Next.js frontend, PostgreSQL/Prisma database, Python HiveQ service, and current provider integrations. No new SaaS business model is implied.

## Phase 1: buyer evaluation and reproducible installation

- Keep `/hiveq/demo` as the public URL, moving its route outside the authenticated layout. No duplicate route may resolve to this URL.
- Use fixed, accurately labeled sample material and questions. Demo interactions are local only: sample selection, answering, answer explanations, score, reset, and export. The demo does not upload files, invoke paid AI providers, seed a database, or grant access to real accounts. Show clearly that it demonstrates sample results rather than live generation.
- Correct inaccurate sample questions. Existing generated-output interfaces should be reused where practical without importing authenticated providers into the public demo.
- Give the demo public navigation and links back home and to signup; do not render authenticated menus.
- Strengthen landing-page copy around notes-to-quiz, tutor study modes, and community support. Retain the existing visual identity. Use actual local application captures where possible, with sample data and clear labeling; do not invent testimonials, customer counts, endorsements, or product capabilities.
- Remove build-time Google Fonts fetching. Use licensed, locally bundled fonts and include their license, or use a documented system-font fallback if font redistribution cannot be established. Do not depend on private Next.js development-tool font paths at runtime.
- Repair the Python setup so its environment location is anchored to the backend directory regardless of the caller's working directory. Keep dependency installation separate from changing provider accounts or deploying services.
- Replace the boilerplate README with an overview and complete first-run path. Add focused buyer guides for configuration, deployment, operations, troubleshooting, and transfer.

## Phase 2: authentication modernization

- Replace Lucia and its Prisma adapter with a maintained authentication library. Better Auth with PostgreSQL/Prisma is the proposed default, subject to a compatibility check against the installed Next.js, React, Prisma, and Node versions before pinning a stable supported release. Do not select a beta release to force compatibility. If no compatible stable release meets the preservation requirements, report the specific conflict and revise this phase before implementation.
- Preserve immutable user IDs, usernames, Argon2 password hashes, Google account identity, profile data, preferences, content relationships, admin IDs, and verified/unverified status. Users must not need to reset passwords solely because of migration.
- Preserve username/password login, Google sign-in, email verification, password recovery, onboarding redirects, and existing public route URLs. Existing sessions may expire at cutover; document that users must sign in again. Existing verification/reset links must either remain accepted for their bounded lifetime or have a documented, working resend/recovery path.
- Use additive reviewed schema migrations and an idempotent account migration with dry-run output limited to counts. Do not log hashes, tokens, credentials, or personal records. Do not automatically run a migration against the configured live database.
- Preserve shared database-backed abuse limits, server-only secrets, secure cookies, ownership checks, and fail-closed admin access. Support trusted origins explicitly; do not accept arbitrary callback origins.
- Test session creation, expiration, renewal, logout, recovery revocation, account verification enforcement, wrong passwords, OAuth identity matching, and preservation of migrated user relationships. Authentication must be established on the server for every protected operation.
- Document backup, cutover, validation, rollback boundaries, and re-login behavior before any deployment. Exercise migration on a disposable PostgreSQL database before declaring this phase complete.

## Phase 3: verification and release material

- Add meaningful behavior/integration checks where the current source-pattern tests cannot establish behavior. Use existing tests for baseline coverage, not as sole proof that workflows work.
- Verify public access to landing/demo, protected-route rejection, signup, verification, login, recovery, onboarding, posts/uploads, quizzes, tutor modes, messaging, and moderation.
- Run fresh lint, typecheck, Node tests, Python tests, schema validation, and production build. Use a disposable test database for integration tests; never reset a configured production database.
- Add repeatable automated checks suitable for CI, with separate explicit requirements for database-backed tests and external-provider checks. Provider-dependent checks must not silently pass when credentials are absent.
- Record what ran, what passed, what was skipped, and why. Clearly distinguish fixture-based checks from live provider verification. Public/live deployment remains unverified until tested on the intended deployment.
- Create a distribution method with an explicit allowlist of runtime source, schema/migrations, public assets, docs, dependency manifests/lockfiles, and required configuration. Exclude secrets, user records, local environments, caches, logs, editor metadata, knowledge-graph data, and platform-generated binaries. Verify archive contents without printing secret values.
- Produce a listing fact sheet, screenshot shot list, and short walkthrough script. Generate actual screenshots or video only from a verified running build using approved sample data. Missing live evidence remains listed as a release blocker rather than replaced with a fictional result.

## Buyer documentation

Cover supported runtime versions; frontend/backend install; all required environment variables and how to obtain them; database creation/migrations; sample/demo operation; Google redirect registration; email DNS setup; admin configuration; Stream and UploadThing setup; separate frontend/backend deployment; scheduled cleanup; backups and restore; logs; rate limits; failure recovery; and update procedures.

The operating-cost sheet must distinguish deployment cost, provider usage, storage, email, and chat charges. Date and link official pricing references; show explicit usage assumptions rather than promise a fixed monthly bill. Clearly distinguish required production integrations from features that can be evaluated with fixed samples.

The transfer checklist should work for either sales route. Explain transferable assets and buyer-created provider accounts without assuming a provider account can legally or technically be transferred. Include an asset provenance register with verified/unknown status. Do not add an open-source license or grant exclusivity, resale rights, lifetime support, or ownership on the owner's behalf. The commercial license or sale agreement remains an owner decision.

## Constraints and boundaries

- No billing/subscription system, multi-school tenancy, mobile app, feature expansion, or wholesale visual redesign in this scope.
- No real student data in demos, screenshots, archives, or test fixtures.
- No public publishing, production migrations, provider-account transfers, or marketplace submission as part of local preparation. Prepare reviewable artifacts and commands first; deploy only within subsequent explicit authorization.
- Do not remove existing user data or weaken access controls to make a demo easier.
- Read the installed Next.js documentation before route, rendering, or framework changes; use graphify for scoped codebase navigation and update the graph after code changes.
- No invented legal ownership claims or unverified production-readiness badges. Unknown university/collaborator/image rights remain owner-confirmation items.

## Completion criteria

Repository work is complete when the public demo works, setup is reproducible, authentication modernization and migration pass local integration checks, buyer documentation and packaging exist, and all executable checks have current recorded results. Sale release is complete only after outstanding provider/live-deployment verification and owner rights/licensing confirmations are resolved. Track these as separate states so local completion cannot be mistaken for a fully verified live business.

## Implementation discretion

The implementer chooses component boundaries, test framework details, documentation file layout, screenshot capture tooling, and exact stable dependency versions after checking compatibility. Use small changes and existing interfaces where practical. Major scope changes, destructive migration requirements, or loss of existing authentication capabilities require a design revision.

## Primary evidence

- Local audit: `docs/sale-readiness-audit.md`.
- Installed Next.js guides: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` and `node_modules/next/dist/docs/01-app/02-guides/authentication.md`.
- Better Auth installation: https://better-auth.com/docs/installation
- Better Auth database/schema guidance: https://better-auth.com/docs/concepts/database

These external references establish integration concepts, not confirmation that a particular package version is compatible with EduHive. Pin and verify the selected version during implementation planning.
