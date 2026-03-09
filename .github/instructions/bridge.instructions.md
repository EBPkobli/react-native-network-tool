---
applyTo: apps/bridge/**
---

# Bridge Layer Instructions

## Package: `@network-tool/bridge`

Located in `apps/bridge/`. This is the local Node.js service that sits between the RN SDK and the web dashboard.

## Architecture

```
src/
├── index.ts       → server bootstrap + CLI entry
├── server.ts      → Express HTTP setup + CORS
├── routes.ts      → POST/GET/DELETE /api/events
├── store.ts       → in-memory event array
└── websocket.ts   → WS broadcast to dashboard clients
```

## Key Rules

1. **Express + ws.** Use Express for HTTP and the `ws` library for WebSocket. No Socket.io.
2. **In-memory only.** Store events in a plain array. No database, no file persistence for MVP.
3. **Validate incoming events.** Use `isValidEvent()` from `@network-tool/shared` on every POST. Reject malformed payloads with 400.
4. **CORS headers.** The dashboard runs on a different port during dev. Bridge must allow localhost origins.
5. **Serve dashboard.** In production mode, bridge serves the built dashboard as static files from a known path.
6. **Single session.** One event array. `DELETE /api/events` clears it. No multi-session support.
7. **No authentication.** This is a localhost-only dev tool.

## API Contract

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/events` | POST | Receive a NetworkEvent from SDK |
| `/api/events` | GET | Return all stored events |
| `/api/events` | DELETE | Clear current session |

WebSocket: connected clients receive each new event as a JSON message immediately after ingestion.

## Shared Contract

The bridge consumes `NetworkEvent` and `isValidEvent` from `@network-tool/shared`. Do not modify the shared types without updating validation logic.
