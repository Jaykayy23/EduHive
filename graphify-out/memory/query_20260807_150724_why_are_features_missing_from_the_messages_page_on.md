---
type: "query"
date: "2026-08-07T15:07:24.336436+00:00"
question: "Why are features missing from the messages page on mobile?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Chat.tsx", "ChatSidebar.tsx", "ChatChannel.tsx", "NewChatDialog.tsx"]
---

# Q: Why are features missing from the messages page on mobile?

## Answer

The mobile view initialized with the conversation sidebar closed, hiding conversation search and new-chat controls while desktop CSS forced both panes visible. A fixed-height new-chat results list could also push the footer action off short screens, and the chat height could overlap the fixed bottom navigation. The fix opens the conversation list first on mobile, preserves two-pane desktop behavior, adds accessible navigation controls, bounds the dialog to the viewport, and reserves bottom-navigation safe space.

## Outcome

- Signal: useful

## Source Nodes

- Chat.tsx
- ChatSidebar.tsx
- ChatChannel.tsx
- NewChatDialog.tsx