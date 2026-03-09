---
applyTo: apps/dashboard/**
---

# Dashboard Layer Instructions

## Package: `@network-tool/dashboard`

Located in `apps/dashboard/`. This is the React + Vite SPA that displays captured network events.

## Architecture

```
src/
├── main.tsx              → React entry point
├── App.tsx               → layout shell
├── api/
│   └── client.ts         → REST + WebSocket connection to bridge
├── components/
│   ├── RequestList.tsx    → main table of captured requests
│   ├── RequestDetail.tsx  → detail panel (headers, body, timing)
│   └── FilterBar.tsx      → method + status filters
└── store/
    └── events.ts          → local state management (useReducer)
```

## Key Rules

1. **React 18 + Vite.** No Next.js, no SSR. This is a simple SPA served as static files.
2. **No external state library for MVP.** Use `useReducer` + React context. Add zustand later only if needed.
3. **Plain CSS or CSS Modules.** No Tailwind, no styled-components for MVP.
4. **WebSocket for live updates.** Connect on mount, receive new events, append to local state.
5. **REST for initial load.** `GET /api/events` on first connect to load existing events.
6. **Auto-reconnect.** If WS disconnects, reconnect and re-fetch full event list.
7. **No direct communication with RN app.** Dashboard only talks to the bridge.

## Shared Contract

Dashboard imports `NetworkEvent` type from `@network-tool/shared` at build time for type safety. The runtime data comes from the bridge API.
