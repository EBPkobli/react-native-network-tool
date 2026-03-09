---
mode: network-tool-agent
description: "Add axios interceptor adapter for the SDK"
---

# 06 — SDK Axios Integration (Post-MVP)

Add an optional axios interceptor to the SDK.

Context:
- Axios on React Native defaults to XMLHttpRequest, not fetch
- Our fetch interceptor does NOT capture XHR-based axios calls
- We need a dedicated axios adapter that creates NetworkEvents from axios interceptors

Your task:
- Create `packages/sdk/src/axios-adapter.ts`
- Provide a function like `attachAxiosInterceptor(axiosInstance)` that:
  - Attaches request + response interceptors
  - Builds NetworkEvent from axios request/response/error
  - Sends via processEvent()
- Keep it optional — SDK works without axios installed

Constraints:
- axios must NOT be a dependency — use type-only imports or duck-typing
- This is an opt-in feature, not auto-detected
- Do not change the core fetch interceptor
- Do not change shared types

Output format:
1. Goal
2. Files created
3. Code
4. Usage example
5. How to test
