# EduHive

See [verification and sale-release status](docs/buyer/verification.md) for current test evidence and the remaining live-service and ownership checks before listing.

EduHive combines a student community with study tools: posts, comments, bookmarks, messaging, document-to-quiz generation (HiveQ), and a study tutor. The Next.js application uses PostgreSQL/Prisma; HiveQ runs as a separate Python/FastAPI service. Live AI, email, chat, and storage require buyer-controlled provider accounts.

Start with `/hiveq/demo` for a public, clearly labeled fixed-sample quiz. Answer questions, review explanations, reset, and export a sample without signing in or paying for generation. Live uploads, AI generation, and user content remain authenticated.

## First run

Use Node.js 22 LTS (22.14+ supports the repository's test command), npm, Python 3.12, and PostgreSQL. The Next.js minimum engine is Node 20.9, but that minimum does not cover the type-stripping test flags.

```powershell
npm ci
Copy-Item .env.example .env  # fresh checkout only; never overwrite an existing file
# Configure your development database and services; read setup before migrations.
npx prisma migrate deploy
npm run dev
```

The complete frontend/backend procedure, provider registration, and environment reference are in [Setup](docs/buyer/setup.md). An existing database requires the [authentication cutover procedure](docs/buyer/authentication.md), backup, and disposable rehearsal before deployment.

## Buyer and operator guides

- [Setup and configuration](docs/buyer/setup.md)
- [Separate frontend/backend deployment](docs/buyer/deployment.md)
- [Operations, backups, restore, and troubleshooting](docs/buyer/operations.md)
- [Dated cost assumptions and official pricing](docs/buyer/costs.md)
- [Exclusive-sale and source-license transfer checklists](docs/buyer/transfer.md)
- [Asset provenance and unresolved rights](docs/buyer/asset-provenance.md)
- [Listing facts, screenshots, and walkthrough](docs/buyer/listing.md)

## Verification and distribution

```powershell
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
node scripts/package-source.mjs
```

From `ml-backend`, run `.\.venv\Scripts\python -m unittest discover -s tests -v` after backend setup. Provider and disposable-database checks have additional requirements in the guides; fixture tests do not prove live behavior.

Packaging creates a new `release/eduhive-source/` staging folder and deterministic `SOURCE_MANIFEST.json`. It uses explicit allowlists, excludes local environments and generated artifacts, and refuses symlinks and recognizable sensitive artifacts inside included trees. Review every staged file and the provenance register before archiving. Provider accounts, customer data, and repository history are not included.

No commercial license for the product as a whole is granted here. Exclusive ownership, source licensing, support scope, third-party rights, and live-business claims require the owner's confirmation and a separate agreement. See the transfer checklist for release gates.
