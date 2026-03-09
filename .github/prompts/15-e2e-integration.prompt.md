---
mode: network-tool-agent
description: "Test the full end-to-end flow: RN app → bridge → dashboard"
---

# 15 — End-to-End Integration

Test and fix the complete flow across all 3 layers.

Steps:
1. Start the bridge (`apps/bridge`)
2. Start the dashboard (`apps/dashboard`) or use bridge-served static files
3. Use the SDK in a test script or RN app
4. Verify events appear in the dashboard in real time

Your task:
- Verify the happy path works end-to-end
- Verify error events (network failures) are captured
- Verify masking works (Authorization header shows [REDACTED])
- Verify large body truncation works
- Verify clear session works
- Verify WebSocket reconnection works
- Document any issues found
- Fix any integration bugs

Additionally:
- Add `__DEV__` guard documentation for the SDK
- Document `adb reverse tcp:8347 tcp:8347` for Android emulator
- Create a minimal test script that sends fake events to the bridge (for testing without RN app)

Output format:
1. Integration test results
2. Bugs found and fixed
3. Final setup instructions
4. What's ready and what's deferred
