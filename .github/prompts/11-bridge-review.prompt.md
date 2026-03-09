---
mode: network-tool-agent
description: "Review the complete bridge layer for bugs, gaps, and quality"
---

# 11 — Bridge Review

Do a full review of the bridge layer (`apps/bridge`).

Read ALL files in `apps/bridge/src/`.

Check for:
1. **Input validation** — Is every POST payload validated? Are malformed requests rejected?
2. **CORS** — Will the dashboard be able to connect from a different port?
3. **WebSocket** — Are disconnections handled? Is broadcast efficient?
4. **Memory** — Is the event array unbounded? Should there be a max limit?
5. **Error handling** — Can the bridge crash from bad input?
6. **Types** — Strict mode compliance? Any `any`?
7. **API contract** — Does the API match what the SDK sends and dashboard expects?

Output format:
1. Summary of reviewed files
2. Issues found (critical / medium / low)
3. Recommended fixes
4. Verdict: ready for Layer 3 or not?
