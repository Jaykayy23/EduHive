---
type: "query"
date: "2026-08-10T16:43:11.920543+00:00"
question: "Set the shared HiveQ key, server URL, production environment, apply the Prisma migration, and redeploy both services"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Deploy on Render", "hiveq-server.ts", "Prisma", "QuestgenService"]
---

# Q: Set the shared HiveQ key, server URL, production environment, apply the Prisma migration, and redeploy both services

## Answer

Expanded from original query via vocab: [deploy, render, vercel, hiveq, questgen, api, backend, url, key, prisma, migration, database]. Confirmed Vercel project edu-hive-z6ar, Render service EduHive, and Neon project eduhive-social-media-app. Required variables are missing. The ownership migration is pending in Prisma and passed verification on an isolated Neon branch. Production changes require explicit approval; use Prisma migrate deploy so migration history remains canonical, then deploy through a reviewed code change.

## Outcome

- Signal: useful

## Source Nodes

- Deploy on Render
- hiveq-server.ts
- Prisma
- QuestgenService