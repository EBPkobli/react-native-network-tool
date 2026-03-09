---
mode: network-tool-agent
description: "Add bridge API refinements: pagination, filtering, static serving"
---

# 10 — Bridge API Refinements

Enhance the bridge with:
1. Dashboard static file serving from `apps/dashboard/dist/`
2. Basic query filtering on GET /api/events (by method, status range)
3. Event count endpoint or header
4. Graceful shutdown handling

Read the current bridge code first:
- `apps/bridge/src/store.ts`
- `apps/bridge/src/routes.ts`
- `apps/bridge/src/server.ts`

Constraints:
- Keep changes minimal
- Do not restructure existing code
- Do not add a database

Output format:
1. Goal
2. Files modified
3. Code changes
4. How to test
5. Next step
