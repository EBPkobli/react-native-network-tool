---
applyTo: packages/sdk/**
---

# SDK Layer Instructions

## Package: `@network-tool/sdk`

Located in `packages/sdk/`. This is the React Native SDK that developers install in their apps.

## Architecture

```
src/
├── index.ts          → public API: NetworkInspector.init(), .disable(), .isEnabled()
├── interceptor.ts    → fetch monkey-patch (install/uninstall)
├── event-builder.ts  → normalize raw fetch data → NetworkEvent
├── masking.ts        → header value redaction
└── transport.ts      → send events to bridge (HTTP POST, replaceable interface)
```

## Key Rules

1. **Zero runtime dependencies.** The SDK must not add any npm dependencies. It uses only globals (`fetch`, `crypto`, `Date`, `Headers`, `FormData`, etc.)
2. **Never crash the host app.** Every external call (transport, body reading) must be wrapped in try/catch. The SDK fails silently.
3. **Avoid infinite recursion.** The transport uses the ORIGINAL un-patched `fetch` reference saved before interception. Never call the patched `fetch` from transport.
4. **Production safety.** `init({ enabled: __DEV__ })` or `init({ enabled: false })` must result in zero overhead. When disabled, no patching occurs.
5. **Clone responses.** Always `response.clone()` before reading the body. The app must receive the untouched original response.
6. **Truncate large bodies.** Default 64KB max. Configurable via `maxBodySize`.
7. **Fire-and-forget transport.** `transport.send()` is async but we never await it in the interceptor hot path.

## Current Status

Foundation is DONE:
- `index.ts` — init/disable/isEnabled + processEvent/getConfig
- `event-builder.ts` — buildEvent, buildErrorEvent, header/body helpers
- `masking.ts` — maskHeaders, maskEvent
- `transport.ts` — Transport interface + createHttpTransport

Next step: `interceptor.ts` — the fetch monkey-patch.

## Shared Contract

The SDK produces `NetworkEvent` objects defined in `@network-tool/shared`. Do not modify that type without updating all consumers.
