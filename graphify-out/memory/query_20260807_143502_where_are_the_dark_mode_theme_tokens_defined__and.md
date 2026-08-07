---
type: "query"
date: "2026-08-07T14:35:02.388889+00:00"
question: "Where are the dark mode theme tokens defined, and which components depend on background, card, popover, muted, border, and sidebar colors?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Dark Mode", "css", "Card()", "popover", "TrendsSidebar.tsx"]
---

# Q: Where are the dark mode theme tokens defined, and which components depend on background, card, popover, muted, border, and sidebar colors?

## Answer

Expanded from original query via graph vocabulary: theme, dark, global, css, color, background, card, popover, border, sidebar, surface, tokens. The semantic dark palette is centralized in app/globals.css and feeds shared shadcn primitives plus the application shell through Tailwind theme variables.

## Outcome

- Signal: useful

## Source Nodes

- Dark Mode
- css
- Card()
- popover
- TrendsSidebar.tsx