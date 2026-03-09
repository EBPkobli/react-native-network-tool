---
mode: network-tool-agent
description: "Implement SDK foundation: types, masking, transport, event builder"
---

# 04 — SDK Foundation

Implement only the core foundation of Layer 1.

Scope:
- Create the shared package with NetworkEvent types and constants
- Create SDK package structure
- Create masking utilities
- Create transport interface and HTTP transport
- Create event builder (request/response → NetworkEvent)
- Create public API shell (init/disable/isEnabled)

Do NOT implement:
- Fetch patching (interceptor.ts)
- Axios integration
- Layer 2 or Layer 3

Requirements:
- Code should be modular (one file = one concern)
- Each file should have a clear, narrow purpose
- The transport must use the original un-patched fetch reference

Output format:
1. Goal
2. Files created
3. Code
4. How it connects to the next step
5. How to test locally (`npm run build`, `npm run typecheck`)
