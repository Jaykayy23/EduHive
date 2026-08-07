---
type: "query"
date: "2026-08-07T14:59:52.798601+00:00"
question: "Why do the subject tabs look displaced on mobile?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["SubjectFilter.tsx", "Navbar.tsx", "Button()"]
---

# Q: Why do the subject tabs look displaced on mobile?

## Answer

The subject filter was a custom sticky chip row pinned to top 0 inside a page with a separate sticky mobile header. It also used absolute fade overlays and hand-styled buttons. The fix removes mobile stickiness, contains the row in the feed width, enables horizontal snap scrolling, and uses semantic shadcn Button variants with pressed state.

## Outcome

- Signal: useful

## Source Nodes

- SubjectFilter.tsx
- Navbar.tsx
- Button()