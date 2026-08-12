---
type: "query"
date: "2026-08-12T14:45:20.008662+00:00"
question: "also the trending topics, not on mobile , and also on large screens where it is u cant scroll to see it u can just see part of it"
contributor: "graphify"
outcome: "useful"
source_nodes: ["TrendsSidebar.tsx", "TrendingTopics()", "Home()"]
---

# Q: also the trending topics, not on mobile , and also on large screens where it is u cant scroll to see it u can just see part of it

## Answer

Expanded from original query via graph vocab: [sidebar, mobile, scroll, viewport, home]. TrendsSidebar.tsx owns the desktop sidebar and TrendingTopics; Home renders the compact mobile sections. The fix extracts reusable TrendingTopics, adds a mobile horizontal ScrollArea, and bounds the sticky desktop rail to the viewport with vertical overflow.

## Outcome

- Signal: useful

## Source Nodes

- TrendsSidebar.tsx
- TrendingTopics()
- Home()