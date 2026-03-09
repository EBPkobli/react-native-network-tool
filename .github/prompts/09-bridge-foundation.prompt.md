---
mode: network-tool-agent
description: "Implement bridge foundation: Express server, store, routes, WebSocket"
---

# 09 — Bridge Foundation

Implement the core bridge service.

Read these first:
- `packages/shared/src/types.ts`
- `packages/shared/src/constants.ts`
- `packages/shared/src/validation.ts`

Your task — create the following in `apps/bridge/src/`:
1. `store.ts` — in-memory event array with add/getAll/clear methods
2. `routes.ts` — Express router with POST/GET/DELETE /api/events
3. `websocket.ts` — WS server that broadcasts new events to connected clients
4. `server.ts` — Express app setup with CORS and route mounting
5. `index.ts` — CLI entry that starts the server

Requirements:
- Use `isValidEvent()` to validate POST payloads
- Return 400 for invalid events
- Set CORS headers for localhost
- WebSocket clients receive each new event as a JSON string
- Server logs its URL on startup

Do NOT implement:
- Dashboard static file serving (later step)
- Persistent storage
- Authentication

Output format:
1. Goal
2. Files created
3. Code
4. How to test (curl commands)
5. Next step
