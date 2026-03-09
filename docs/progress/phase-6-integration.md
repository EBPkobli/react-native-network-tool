# Phase 6 — E2E Integration

## Status: COMPLETE

## What Was Done

### 1. E2E test script (`scripts/e2e-test.mjs`)
- Standalone Node.js ESM script — no build step, runs with `node` directly
- Sends 8 scenario types: happy GET/POST, duplicate, slow (>3s), 401, 404, network error, large body
- Verifies storage via `GET /api/events`, filter params (`method=GET`, `status=4xx`, `url=login`)
- Large-body scenario (64 KB body) verifies bridge stores without corruption
- Root script alias: `npm run test:e2e`

### 2. WS manual reconnect (dashboard)
- `BridgeContext` now exposes `reconnect: () => void`
- `BridgeProvider.manualReconnect()` clears pending timers, resets counter, calls `connect()`
- `App.tsx` renders a `toolbar-btn--warn` **Reconnect** button when `connectionStatus === 'disconnected'`
- CSS: `toolbar-btn--warn` uses `var(--status-4xx)` orange-red colour

### 3. README overhaul
- SDK setup section: basic + axios examples
- `__DEV__` guard section — explains why it must always be explicit
- Device connectivity matrix: Android emulator (`adb reverse`), iOS simulator (no-op), physical device (LAN IP)
- Sensitive data masking section
- E2E integration test instructions

## Integration Flow Verified (by review)

```
NetworkInspector.init({ enabled: __DEV__ })
  └── resolveConfig()              ← merges user config with defaults
  └── buildMaskSet(maskedHeaders)  ← cached Set, allocated once
  └── installInterceptor()         ← monkey-patches globalThis.fetch

fetch(url, init)                   ← any call in the RN app
  └── interceptor fires
      ├── bridge skip guard        ← prevents infinite loop
      ├── buildEvent() / buildErrorEvent()
      ├── maskEventWithSet()       ← no alloc per event
      └── transport.send()         ← fire-and-forget POST to /api/events

POST /api/events
  └── isValidEvent()               ← rejects malformed payloads
  └── store.add(event)
  └── broadcastEvent(event)        ← WS broadcast to dashboard

Dashboard receives WS message
  └── dispatch({ type: 'EVENT_RECEIVED' })
  └── useFilteredEvents()          ← marks isDuplicate + isSlow
  └── RequestList re-renders
```

## Known Constraints
- Truncation (`maxBodySize = 64 KB`) happens inside the SDK `event-builder.ts` — **not** the bridge
- The bridge's `express.json({ limit: '512kb' })` is an upper bound for malformed payloads; well-behaved SDK calls never exceed 64 KB per body
- WS auto-reconnect: 5 attempts × 2 s = 10 s maximum before manual reconnect is required

## Next Phase
Phase 7 — SDK browser bundling test in a real RN app, or package publishing prep.
