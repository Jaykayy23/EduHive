---
type: "query"
date: "2026-08-12T14:16:20.368072+00:00"
question: "and also on big screens the who to follow shows, but for mobile there is no who to follow, since its a small screen it cant show on the home page. what will be best thing to do. and also, when there is a new user it shows on the who to follow section, but is there a limit to how many that can show at a time because if we have 100 users will all show there? whats the best approach"
contributor: "graphify"
outcome: "useful"
source_nodes: ["WhoToFollow()", "getCachedUsersToFollow()", "TrendsSidebar.tsx", "Home()"]
---

# Q: and also on big screens the who to follow shows, but for mobile there is no who to follow, since its a small screen it cant show on the home page. what will be best thing to do. and also, when there is a new user it shows on the who to follow section, but is there a limit to how many that can show at a time because if we have 100 users will all show there? whats the best approach

## Answer

Expanded via graph vocab: [whotofollow, getcacheduserstofollow, follow, user, mobile, sidebar, limit, home]. TrendsSidebar is hidden on the home page below xl, and getCachedUsersToFollow excludes the current/already-followed users and uses take: 5, so at most five suggestions render even with 100 users. Recommended: extract WhoToFollow into a reusable component; retain five in the desktop sidebar; add a compact horizontal, snap-scrolling mobile section in the home feed showing 3-5 candidates plus See all; add a dedicated paginated people-discovery route as the long-term surface. Add deterministic relevance ordering because the current findMany has no orderBy, and remove/backfill suggestions immediately after following.

## Outcome

- Signal: useful

## Source Nodes

- WhoToFollow()
- getCachedUsersToFollow()
- TrendsSidebar.tsx
- Home()