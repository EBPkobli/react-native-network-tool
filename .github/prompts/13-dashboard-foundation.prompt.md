---
mode: network-tool-agent
description: "Scaffold dashboard: Vite + React, bridge client, basic layout"
---

# 13 — Dashboard Foundation

Scaffold the dashboard app.

Your task:
1. Set up Vite + React + TypeScript in `apps/dashboard/`
2. Create the bridge client (`src/api/client.ts`) — REST + WebSocket
3. Create the state store (`src/store/events.ts`) — useReducer
4. Create the root layout (`App.tsx`)
5. Create a basic `RequestList` component that renders events in a table
6. Wire everything: connect to bridge on mount, show live events

Requirements:
- Table columns: method, URL, status, duration, timestamp
- Auto-reconnect WebSocket on disconnect
- Fetch existing events on first connect
- Show connection status indicator

Do NOT implement:
- Request detail panel (next step)
- Filters (next step)
- Styling polish

Output format:
1. Goal
2. Files created
3. Code
4. How to test (start bridge + dashboard, verify connection)
5. Next step
