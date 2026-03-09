# Network Inspector — Test App

Minimal Expo React Native app to verify the Network Inspector SDK + Bridge + Dashboard E2E flow.

## Prerequisites

1. **Build the SDK** (from monorepo root):
   ```bash
   npm run build
   ```

2. **Start the Bridge**:
   ```bash
   npm run dev:bridge
   ```

3. **Start the Dashboard**:
   ```bash
   npm run dev:dashboard
   ```

## Run the app

```bash
cd examples/test-app

# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator (requires adb reverse first!)
adb reverse tcp:8347 tcp:8347
npx expo start --android

# Web (quickest, no emulator needed)
npx expo start --web
```

## What it does

- Initializes `NetworkInspector` from `@network-tool/sdk`
- Provides buttons to fire various `fetch()` calls (GET, POST, PUT, DELETE, 404, network error)
- The SDK intercepts each call, masks `Authorization` + `X-Api-Key` headers, and sends events to the bridge
- Open the dashboard at `http://localhost:5173` to see them live

## Verifying the flow

1. Open the dashboard, connect to port `8347`
2. In the app, tap **Run All Requests**
3. Watch the requests appear in the dashboard sidebar
4. Click a request to inspect General info, Headers, Payload, Response, and Timing
5. Verify that `Authorization: Bearer my-secret-token-12345` shows as `[REDACTED]`
6. Verify that `X-Api-Key: secret-api-key` shows as `[REDACTED]`
7. Verify that the 💥 Network Error request shows with `success: false` and an error message
