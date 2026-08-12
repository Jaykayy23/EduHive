---
type: "query"
date: "2026-08-12T14:57:05.143884+00:00"
question: "on the home page on moblie the who to follow and trending topics all show. which makes the home page too long. what is your best approach to this"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Home()", "WhoToFollow()", "TrendingTopics()", "TrendsSidebar.tsx"]
---

# Q: on the home page on moblie the who to follow and trending topics all show. which makes the home page too long. what is your best approach to this

## Answer

Expanded from graph vocabulary: [home, mobile, feed, follow, trending, topics, sidebar, layout, hidden, show]. The current home page renders both mobile discovery cards before HomePageContent, pushing the feed below secondary content. Best approach: make mobile home feed-first; remove both full cards from the top; expose a Discover destination with People and Topics tabs, using the existing /people route and a new topics/explore surface; optionally inject one compact horizontal module after several posts, never both together. Keep the desktop sidebar unchanged. Existing queries already cap each home module at five items.

## Outcome

- Signal: useful

## Source Nodes

- Home()
- WhoToFollow()
- TrendingTopics()
- TrendsSidebar.tsx