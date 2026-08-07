---
type: "query"
date: "2026-08-07T21:53:31.397938+00:00"
question: "if i push it to github will it update on render?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Deploy on Render", "QuestgenService"]
---

# Q: if i push it to github will it update on render?

## Answer

Expanded from original query via graph vocab: [render, deploy, repository, main, service, build, backend, frontend]. The repository render.yaml defines the hiveq-api Docker web service with autoDeployTrigger commit, so a push to its linked branch triggers a Render backend deployment if the service remains connected and auto-deploy is enabled. The current main branch already matches origin/main at commit 515c0d6. The Render Blueprint contains only the HiveQ API; the Next.js frontend is documented for Vercel and must redeploy through its own connected host.

## Outcome

- Signal: useful

## Source Nodes

- Deploy on Render
- QuestgenService