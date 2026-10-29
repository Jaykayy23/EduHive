# Transfer checklist

Keep both an exclusive project sale and repeatable source-code licensing available until the owner chooses commercial terms. This checklist grants neither. It does not establish ownership, exclusivity, resale rights, perpetual support or provider-account transferability. Resolve the [provenance register](asset-provenance.md) before making those promises.

## Before either transaction

- Agree the exact release, source/asset inventory, excluded items, price/payment mechanism, acceptance criteria, support duration, update obligations, warranty limitations, and permitted rights in a separate reviewed agreement. State whether domains/brand/history/data are included. Keep personal records out of evaluation archives.
- Confirm university/employer/coursework, collaborator, contractor and third-party rights. Record contributor assignments/permissions; replace or remove unconfirmed assets before distribution as required. Inventory dependency licenses separately from original source rights.
- Run current verification, disposable PostgreSQL auth migration and restore rehearsal. Record checks/versions and outstanding live provider gates. Do not describe fixture checks as production evidence.
- Build and review a new source staging folder and manifest. Secret-name/content checks are defense in depth, not proof that arbitrary source text is safe. Review every file; scan for real URLs, embedded credentials, account IDs, personal content and unsupported asset claims.
- Buyer creates provider/hosting accounts and secrets by default. Check each provider's contractual and technical transfer process before promising an account transfer. Never transmit a shared password or seller's API keys as a substitute.

## Exclusive project sale

1. Define exactly which original rights, repository, brand/domain, documents and other assets the owner can assign. Resolve prior licenses, encumbrances and retained rights before promising exclusivity.
2. Use an agreed controlled private repository transfer or the clean archive. A Git history transfer needs a separate history/secret/data review: the staging tool deliberately does not include `.git`. Rotate any historically exposed secrets regardless of removal.
3. If a domain is included, follow registrar transfer/unlock/authorization procedures, document DNS/TLS/email dependencies and timing, and verify ownership using registrar mechanisms. Do not change DNS during evaluation.
4. If a live operation or data is separately included, first establish lawful authority, notices/consents, retention, export/import scope, security and processor arrangements. Transfer no student/customer records by default. Database, UploadThing objects and Stream history are separate inventories.
5. Rehearse migration into buyer staging, validate agreed journeys and recovery, then schedule authorized live cutover, secret rotation, canonical URLs/callbacks, cron and monitoring. Retire seller access only after agreed acceptance and verified buyer access.
6. Record completion/receipt and owner obligations concerning retained copies and future licensing under the signed agreement. No such obligation is created by this guide.

## Repeatable source license

1. Owner defines rights to use/modify/deploy, number of projects/end users, redistribution/resale restrictions, source delivery, updates and support in a separate license. Do not use exclusive-sale copy for this offer.
2. Deliver a versioned clean source archive and checksum, examples, setup/runbooks and known limits. Do not include seller hosting accounts, live DB/data, domains, keys, or chat/upload histories unless separately agreed and authorized.
3. Each licensee creates independent databases, provider apps and secrets, registers its own email domain and OAuth callbacks, and configures its own `APP_URL`/admin IDs. A new Stream/storage app needs no seller data import for a clean installation.
4. Confirm buyer can install from a fresh staging copy, run verification, exercise fixed samples, and complete agreed live tests using its own accounts. Track accepted release/version and support scope privately.

## Safe source packaging

```powershell
node --test tests/package-source.test.mjs
node scripts/package-source.mjs release/eduhive-source-v1
# Inspect SOURCE_MANIFEST.json and every staged file before archiving.
python -m zipfile -c ./release/eduhive-source-v1.zip ./release/eduhive-source-v1
python -m zipfile -t ./release/eduhive-source-v1.zip
Get-FileHash ./release/eduhive-source-v1.zip -Algorithm SHA256
```

The tool only creates a new `release/<single-name>` inside the project. Existing output, output elsewhere or nested deeper, symlink/junction output parents and symlinks in included trees are refused. It never deletes existing releases. Pick a new name for each attempt and its ZIP; an interrupted staging folder is incomplete and must not be shipped. Its sorted SHA-256 manifest describes included file bytes, not itself; identical input gives identical manifest bytes, while ZIP metadata may differ. Python's standard-library ZIP command includes dotfiles; inspect the resulting ZIP and verify `.env.example`, `.gitignore`, and `ml-backend/.dockerignore` before delivery. Never archive the repository root wholesale.

Distribution policy explicitly selects runtime source/configuration, buyer docs, schema/migrations, tests and public image assets. It excludes local env files, secrets by recognizable name/content, logs, graph/editor metadata, node_modules, venvs, caches, generated Prisma clients and model binaries. Unknown root files are excluded. Review/update the allowlist when adding a required runtime file; packaging success alone does not prove a runnable installation. Run `npm ci`, tests and build from a fresh extracted copy before release. Redistributability of included images remains an owner gate.

## Acceptance record and remaining gates

Record transaction route, signed agreement, rights evidence, release archive hash/manifest, runtime/build checks, disposable migration result, restore rehearsal, live deployment/provider journeys, buyer-created accounts, credential rotation, DNS/callback/cron checks, admin denied/allowed checks, access removal, and support handoff date. Each unperformed check is **unverified**, with owner and next action. Public publication, production migration, marketplace submission, account transfer and legal rights confirmation are separate actions, not completed by preparing this repository.
