---
mode: network-tool-agent
description: "Design bridge architecture: HTTP, WebSocket, storage, API"
---

# 08 — Bridge Architecture

Focus only on Layer 2: the local Node.js bridge service.

Read the current shared types first:
- `packages/shared/src/types.ts`
- `packages/shared/src/constants.ts`

Your task:
- Design the bridge server architecture
- Define HTTP API endpoints
- Define WebSocket push protocol
- Define in-memory storage model
- Define how the bridge serves the dashboard
- Define the CLI entry point

Constraints:
- Express + ws library (no Socket.io)
- In-memory storage only (no database)
- Single session
- Localhost only
- No authentication

Output format:
1. Layer 2 goal
2. Architecture
3. API contract (endpoints + methods + payloads)
4. WebSocket protocol
5. Storage model
6. Files to create
7. Step-by-step implementation plan
