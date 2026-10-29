# EduHive sale-readiness audit

Reviewed: 2026-10-29. This document records repository findings and release evidence still needed; it is not a production-readiness certification.

## Current findings

- The working tree was clean at the beginning of this review.
- The public landing page links to `/hiveq/demo`, but the demo lives under `app/(main)`, whose layout requires authentication and onboarding. The earlier browser review confirmed that visitors reached login instead of the demo.
- The demo already contains fixed sample questions. Some examples need an accuracy review: “Photosynthesis occurs only in plant cells” is marked true, despite photosynthetic organisms outside plants.
- The README includes provider configuration but still opens with generic Next.js instructions. It lacks a complete buyer installation and operation guide.
- Application sessions depend on the deprecated Lucia package and Prisma adapter. Session validation is shared by protected pages and API routes, so replacing it requires explicit behavior tests for creation, expiration, renewal, logout, verification, password reset, and Google OAuth.
- The root layout downloads Google fonts during compilation. Network restrictions prevented the previous production build from fetching them. This is a reproducibility issue to resolve, not proof of an application compile defect.
- The Next.js frontend depends on PostgreSQL and several provider accounts. HiveQ also requires a Python service. Buyer documentation needs a complete service inventory, required credentials, deployment sequence, and usage-cost assumptions.
- The Python setup script creates `.venv` relative to the caller's working directory but resolves the resulting interpreter relative to the script. This can fail when invoked from the repository root; the setup should be independent of the caller's directory.
- The previous review ran 36 passing Node tests plus passing TypeScript and lint checks. Those are historical results, not fresh release evidence. Backend tests were not verified in that environment.

## Acceptance evidence needed before listing

- [ ] Anonymous visitors can open a clearly labeled sample demo without a database account, paid AI requests, uploads, or access to private user data.
- [ ] Sample content is accurate and is explicitly distinguished from live generated output.
- [ ] Landing-page presentation demonstrates real product workflows without fabricated testimonials, customers, or usage statistics.
- [ ] Installation works from a fresh checkout using documented supported Node and Python versions.
- [ ] Production build succeeds without downloading fonts at build time.
- [ ] Deprecated authentication dependencies are replaced and session lifecycle behavior is tested.
- [ ] Signup, verification, login, recovery, onboarding, uploads, quiz generation, tutor, messaging, and moderation have recorded verification results. Tests needing external credentials are labeled clearly if not run.
- [ ] Buyer docs cover setup, migrations, deployment, administration, backups and restore, service limits, troubleshooting, and transfer steps.
- [ ] Operating costs separate required services, usage-based charges, optional features, and dated pricing assumptions.
- [ ] Distribution package excludes credentials, private data, caches, local environments, and unnecessary generated binaries.
- [ ] Owner confirms rights to distribute code and visual assets, any collaborator or university interests, and whether the sale transfers ownership or grants licenses.
- [ ] Public deployment, final screenshots, and walkthrough are verified against the release being offered.

## Delivery boundaries

Repository improvements can be prepared and checked locally. A live production review requires the intended deployment and configured services. Ownership representations, licensing choice, and any asset provenance that cannot be established from repository evidence remain owner decisions. Do not label unknown items as complete.
