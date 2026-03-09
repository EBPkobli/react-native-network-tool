---
mode: network-tool-agent
description: "Design SDK architecture, event model, masking, transport, and public API"
---

# 03 — SDK Architecture

Focus only on Layer 1: the React Native SDK package.

Your task:
- Design the initial architecture of the RN SDK
- Define how request events will be captured
- Define the internal normalized event model
- Define masking strategy for sensitive fields
- Define how events will be sent to the local bridge
- Define the public API of the SDK

Constraints:
- Focus only on Layer 1
- Do not implement Layer 2 or Layer 3
- Start with fetch support; keep axios-friendly
- Keep transport replaceable
- Keep setup minimal for developers

Output format:
1. Layer 1 goal
2. Architecture
3. Event model
4. Masking strategy
5. Public API proposal
6. Files to create
7. Step-by-step implementation plan
