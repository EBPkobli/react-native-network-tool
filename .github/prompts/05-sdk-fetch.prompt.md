---
mode: network-tool-agent
description: "Implement the fetch interceptor that captures HTTP requests"
---

# 05 — SDK Fetch Interceptor

Implement the fetch interceptor for the SDK.

Read the current SDK code first:
- `packages/sdk/src/index.ts`
- `packages/sdk/src/event-builder.ts`
- `packages/sdk/src/transport.ts`
- `packages/sdk/src/masking.ts`

Your task:
- Create `packages/sdk/src/interceptor.ts`
- Wire it into `index.ts` (init installs, disable uninstalls)

The interceptor must:
1. Save a reference to `globalThis.fetch` before patching
2. Replace `globalThis.fetch` with a wrapper that:
   - Records start time
   - Calls the original fetch
   - Clones the response
   - Async: builds event → processes (mask + send) via processEvent()
   - Returns the original response untouched to the caller
3. Handle fetch rejection (network errors) — build an error event
4. Skip interception for requests to the bridge URL (prevent infinite loop)
5. Never throw — all errors caught and swallowed
6. On disable: restore `globalThis.fetch` to the saved original

Constraints:
- Do not modify the event model or shared types
- Do not change masking or transport logic
- This file should be self-contained except for imports from sibling modules

Output format:
1. Goal
2. Files created/modified
3. Code
4. How to test
5. Next step
