# Architecture

## System Diagram

```
┌─────────────────────┐         ┌─────────────────────┐         ┌──────────────────────┐
│   React Native App  │         │    Bridge (Node.js)  │         │  Dashboard (Browser)  │
│                     │         │                      │         │                       │
│  ┌───────────────┐  │  HTTP   │  ┌────────────────┐  │   WS    │  ┌─────────────────┐  │
│  │  SDK          │──┼──POST──▶│  │  /api/events   │──┼───push─▶│  │  Event List     │  │
│  │  (fetch patch)│  │         │  │                │  │         │  │  Detail Panel   │  │
│  └───────────────┘  │         │  │  In-memory     │  │  REST   │  │  Filters        │  │
│                     │         │  │  store         │◀─┼───GET───│  │                 │  │
└─────────────────────┘         │  └────────────────┘  │         │  └─────────────────┘  │
                                │                      │         │                       │
                                │  Serves dashboard    │         │                       │
                                │  as static files ────┼────────▶│                       │
                                └──────────────────────┘         └───────────────────────┘
```

## Shared Contract

The `NetworkEvent` type in `packages/shared/src/types.ts` is the single source of truth.

```typescript
interface NetworkEvent {
  id: string;              // UUID
  timestamp: number;       // epoch ms
  method: string;          // GET, POST, etc.
  url: string;
  requestHeaders: Record<string, string>;
  requestBody: string | null;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string | null;
  duration: number;        // ms
  success: boolean;
  error: string | null;
}
```

## Dependency Graph

```
packages/sdk ───▶ packages/shared ◀─── apps/bridge
                                  ◀─── apps/dashboard (types only)
```

No circular dependencies. No layer imports another layer.

## Tech Stack

| Layer | Technology |
|---|---|
| Shared | TypeScript only, zero deps |
| SDK | TypeScript, zero npm deps, uses only globals |
| Bridge | TypeScript, Express, ws |
| Dashboard | TypeScript, React 18, Vite |
| Build | tsup (libraries), Vite (dashboard) |
| Monorepo | npm workspaces |

## Key Design Decisions

1. **Fetch monkey-patch** — standard RN interception pattern, works with most HTTP libraries
2. **HTTP POST transport** — simpler than WebSocket for SDK→bridge; fire-and-forget
3. **WebSocket push** — real-time updates to dashboard without polling
4. **In-memory storage** — simplest option, sufficient for single dev sessions
5. **No authentication** — localhost-only tool, security boundary is the machine
6. **Bridge serves dashboard** — single process to start, no separate dev server needed in production
