---
type: "implementation"
date: "2026-08-07T23:45:44.280776+00:00"
question: "use the hiveq icon on the menu bar for the one on the page"
contributor: "graphify"
outcome: "useful"
source_nodes: ["MenuBar()", "HiveQPage()", "page.tsx"]
---

# Q: use the hiveq icon on the menu bar for the one on the page

## Answer

Expanded from the original request using graph vocabulary: hiveq, menubar, icon, page. The menu bar uses Lucide BrainCircuit in MenuBar.tsx, so HiveQ page.tsx was changed from Sparkles to BrainCircuit for an exact icon match. No HiveQ behavior or layout was changed. Typecheck, lint, and all 16 tests pass.

## Outcome

- Signal: useful

## Source Nodes

- MenuBar()
- HiveQPage()
- page.tsx