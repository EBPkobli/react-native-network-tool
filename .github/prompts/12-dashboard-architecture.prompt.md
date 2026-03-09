---
mode: network-tool-agent
description: "Design dashboard architecture: components, state, bridge connection"
---

# 12 — Dashboard Architecture

Focus only on Layer 3: the web dashboard.

Read the bridge API contract first:
- `apps/bridge/src/routes.ts`
- `packages/shared/src/types.ts`

Your task:
- Design the dashboard component tree
- Define the state management approach
- Define how the dashboard connects to the bridge (REST + WS)
- Define the core views: request list, request detail, filters
- Define the layout

Constraints:
- React 18 + Vite
- useReducer + context for state (no external library)
- Plain CSS or CSS Modules
- No routing library — single page with panel layout

Output format:
1. Layer 3 goal
2. Component tree
3. State model
4. Bridge connection strategy
5. Files to create
6. Step-by-step implementation plan
