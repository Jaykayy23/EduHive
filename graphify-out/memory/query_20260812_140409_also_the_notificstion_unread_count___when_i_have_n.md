---
type: "query"
date: "2026-08-12T14:04:09.780402+00:00"
question: "also the notificstion unread count . when i have notification and i open the notification page and tap on what i have there and leave notification it does not mark as read and it still shows i have the same unread notifications which i have already opened"
contributor: "graphify"
outcome: "useful"
source_nodes: ["NotificationsPage", "NotificationsButton()", "notifications/unread-count/route.ts", "Notifications()", "notifications/mark-as-read/route.ts"]
---

# Q: also the notificstion unread count . when i have notification and i open the notification page and tap on what i have there and leave notification it does not mark as read and it still shows i have the same unread notifications which i have already opened

## Answer

Expanded from original query via graph vocab: [notification, notifications, unread, read, count, notificationsbutton, notificationspage]. The mark-as-read route used the optional development-only global prisma instead of importing the production client, so production silently skipped updateMany and the unread-count endpoint returned the same count. Fixed by importing @/lib/prisma and calling prisma.notification.updateMany directly; added a regression test.

## Outcome

- Signal: useful

## Source Nodes

- NotificationsPage
- NotificationsButton()
- notifications/unread-count/route.ts
- Notifications()
- notifications/mark-as-read/route.ts