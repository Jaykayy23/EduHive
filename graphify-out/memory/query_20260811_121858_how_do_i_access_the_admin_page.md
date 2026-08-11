---
type: "query"
date: "2026-08-11T12:18:58.450809+00:00"
question: "how do i access the admin page"
contributor: "graphify"
outcome: "useful"
source_nodes: ["page.tsx", "auth.ts"]
---

# Q: how do i access the admin page

## Answer

Expanded from original query via vocab: [admin, auth, authentication, login, accessible]. Open /admin/reports directly. The route validates the current session and only permits a user whose immutable User.id is listed in the comma-separated ADMIN_USER_IDS environment variable; otherwise it redirects to /login. The local .env currently has ADMIN_USER_IDS configured. There is no visible navigation link to this route in the current code search.

## Outcome

- Signal: useful

## Source Nodes

- page.tsx
- auth.ts