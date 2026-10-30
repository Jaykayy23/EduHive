# Dependency declarations and notices

Recorded 2026-10-29 for the committed npm lockfile and the isolated backend environment. These are declaration inventories and review findings, not a legal clearance or a grant of third-party rights.

- [npm inventory](npm-license-inventory.json): 878 resolved entries, including 522 production entries and development/optional platform packages. Records declared licenses, local installation status and SHA-256 hashes of observed top-level license/notice files. 102 optional/other entries were not installed locally; their notices need review on the buyer's target installation.
- [Python inventory](python-license-inventory.json): 36 installed distributions, distinguishing the 8 pinned direct runtime requirements from transitive and installer packages. Records license expressions, classifiers and distribution notice paths.

## Findings requiring buyer attention

- The installed Stream chat/video packages carry vendor-specific source-code licenses, not a blanket MIT license. See their installed `LICENSE` files and [Stream's terms](https://getstream.io/legal/). Provider rights and accounts are separate from the seller's original application. Buyers must establish their own permitted use; do not promise transfer of the seller's SDK/service rights or redistribute vendor source as seller-owned code.
- Sharp/libvips platform packages declare LGPL-3.0-or-later, sometimes combined with Apache-2.0/MIT. `caniuse-lite` declares CC-BY-4.0. Python `certifi` declares MPL-2.0. Preserve the applicable notices and review the obligations for the actual distribution format; do not describe every dependency as permissively licensed.
- Most other npm runtime declarations are MIT, Apache-2.0, BSD, ISC or similar. A declaration alone does not prove that all bundled files have the same license. Buyer installation and container/binary redistribution need their own notices review.

The clean source archive excludes `node_modules`, virtual environments, generated Prisma clients and third-party compiled binaries. Dependency installation downloads packages separately. These exclusions do not establish rights to copied application snippets, UI components or visual assets. Original-source and artwork provenance remains in the [asset register](asset-provenance.md). The seller's commercial license or assignment must exclude third-party ownership claims and be settled separately.

## Owner statements received

The owner states that they were the sole developer building EduHive and generated the logo with ChatGPT. They subsequently clarified that they copied and adapted code from Coding in Flow's Next.js social-media tutorial, then changed it and added features. Sole project development does not mean all source was originally authored by the seller. See [source attribution and outstanding permissions](source-attribution.md). University rights remain unknown. Borrowed active illustrations/placeholders were replaced with original geometric SVGs; unreviewed legacy public assets are excluded from the clean source archive. These are recorded owner statements and observed changes, not independent legal clearance.

For the AI logo, retain the original generation/export and any reference-image permissions. OpenAI's [Terms of Use](https://openai.com/policies/terms-of-use/) address output ownership between the user and OpenAI, subject to applicable law, and note that output may not be unique. They do not establish rights in reference images, university interests or trademark exclusivity. No such exclusivity is promised here.
