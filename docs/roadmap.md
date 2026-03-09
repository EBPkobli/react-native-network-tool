# Roadmap

## Phase Overview

| Phase | Focus | Status |
|---|---|---|
| 1 | Foundation — monorepo, shared types, SDK scaffold | ✅ Done |
| 2 | SDK completion — fetch interceptor | 🔲 Next |
| 3 | Bridge — HTTP + WS + storage | 🔲 Pending |
| 4 | Dashboard — scaffold + core views | 🔲 Pending |
| 5 | Integration — end-to-end + polish | 🔲 Pending |

---

## Phase 1 — Foundation ✅

- [x] Root monorepo with npm workspaces
- [x] `packages/shared` — NetworkEvent type, constants, validation
- [x] `packages/sdk` — package structure, masking, transport, event builder, public API shell
- [x] TypeScript strict mode, tsup builds, typecheck passes

## Phase 2 — SDK Completion

- [ ] `packages/sdk/src/interceptor.ts` — fetch monkey-patch
- [ ] Wire interceptor into init/disable in `index.ts`
- [ ] SDK review (prompt: `07-sdk-review`)
- [ ] Optional: axios adapter (prompt: `06-sdk-axios`, post-MVP)

**Use prompt:** `05-sdk-fetch.prompt.md`

## Phase 3 — Bridge

- [ ] `apps/bridge` — Express server scaffold
- [ ] In-memory store
- [ ] HTTP routes (POST/GET/DELETE /api/events)
- [ ] WebSocket broadcast
- [ ] CLI entry point
- [ ] Bridge review (prompt: `11-bridge-review`)

**Use prompts:** `08-bridge-architecture`, then `09-bridge-foundation`

## Phase 4 — Dashboard

- [ ] `apps/dashboard` — Vite + React scaffold
- [ ] Bridge client (REST + WS)
- [ ] Request list table
- [ ] Request detail panel
- [ ] Filters (method + status)
- [ ] Clear session
- [ ] Basic styling

**Use prompts:** `12-dashboard-architecture`, then `13-dashboard-foundation`, then `14-dashboard-features`

## Phase 5 — Integration & Polish

- [ ] End-to-end test: RN app → bridge → dashboard
- [ ] Bridge serves built dashboard as static files
- [ ] `adb reverse` documentation
- [ ] `__DEV__` guard documentation
- [ ] Test script for sending fake events
- [ ] Full audit (prompt: `16-full-audit`)

**Use prompts:** `15-e2e-integration`, then `16-full-audit`
