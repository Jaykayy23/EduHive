---
type: "query"
date: "2026-08-07T19:56:13.861665+00:00"
question: "now hiveQ when i use it, configure question types and hit generate it loads and shows load failed. its not working like its suppose to"
contributor: "graphify"
outcome: "useful"
source_nodes: ["main.py", "QuestgenService", "HiveQ API"]
---

# Q: now hiveQ when i use it, configure question types and hit generate it loads and shows load failed. its not working like its suppose to

## Answer

Expanded from original query via graph vocabulary: [hive, questgen, generate, question, api, backend, error, configuration, response, loading]. The deployed HiveQ API is healthy and Gemini generation succeeds, but Render has CORS_ORIGINS set only to http://localhost:3000. Requests from https://www.eduhive.xyz and https://edu-hive-z6ar.vercel.app therefore omit Access-Control-Allow-Origin; JSON requests fail preflight and file requests can complete server-side but their responses are blocked by the browser. Correct CORS_ORIGINS to include the production domains.

## Outcome

- Signal: useful

## Source Nodes

- main.py
- QuestgenService
- HiveQ API