# React Native Network Inspector

A local developer tool that captures network activity from React Native apps and displays it in a web dashboard.

## What This Does

1. **SDK** — drop into your RN app to capture all `fetch` requests
2. **Bridge** — local Node.js service that receives and stores events
3. **Dashboard** — browser UI to inspect requests in real time

```
RN App (SDK) ──POST──▶ Bridge (Node.js) ──WS──▶ Dashboard (Browser)
```

## Quick Start

```bash
# 1. Add one line to your app entry (see SDK Setup below)
# 2. Start the bridge
npm run bridge

# 3. Start the dashboard
npm run dashboard

# 4. Open http://localhost:5173
```

## SDK Setup

### Basic (fetch only)

```ts
import { NetworkInspector } from '@network-tool/sdk';

// Only activate in dev builds — __DEV__ is set to false in production RN apps
NetworkInspector.init({ enabled: __DEV__ });
```

### Axios support

```ts
import { attachAxiosInterceptor } from '@network-tool/sdk/axios';
import axios from 'axios';

if (__DEV__) {
  attachAxiosInterceptor(axios);
}
```

### Configuration options

```ts
NetworkInspector.init({
  enabled: __DEV__,              // required — always guard with __DEV__
  bridgeUrl: 'http://localhost:8347', // simplest option
  // or use bridgeHost / bridgeHosts if you need more control
  maskedHeaders: [               // headers whose values are replaced with [REDACTED]
    'authorization',
    'cookie',
    'x-api-key',
    // …default list covers the most common secrets
  ],
  maxBodySize: 65_536,           // max bytes stored per request/response body (default: 64 KB)
});
```

### `__DEV__` guard — why it matters

React Native sets `__DEV__` to `true` during development and `false` in production
builds. **Always pass `enabled: __DEV__`** — this ensures:

- The SDK is a no-op in production (zero overhead, zero network calls)
- No sensitive data is ever captured in releases
- The bridge port is never contacted from production devices

The guard is enforced at the call site, not inside the SDK, so it is always explicit.

## Device Connectivity

### Android emulator

The bridge listens on your host machine. The emulator can reach it via the `adb
reverse` port-forward command:

```bash
adb reverse tcp:8347 tcp:8347
```

Run this once per emulator session (or after a restart). It maps port 8347 on the
emulator to port 8347 on your machine, so `http://localhost:8347` works inside the app.

If you skip `adb reverse`, the SDK will also try `10.0.2.2` automatically when you
leave `bridgeUrl` / `bridgeHost` unset.

### iOS simulator

The iOS simulator shares the host machine's network directly — no extra setup needed.
`http://localhost:8347` works out of the box.

### Physical device (Android or iOS)

Use your machine's LAN IP address instead of `localhost`:

```ts
NetworkInspector.init({
  enabled: __DEV__,
  bridgeHost: '192.168.1.42', // your machine's IP on the local network
});
```

Find your machine's IP with `ipconfig getifaddr en0` (macOS), `ip addr` (Linux),
or check System Preferences → Network.

Make sure both your device and machine are on the same Wi-Fi network and that your
firewall allows connections on port 8347.

## Project Structure

```
packages/shared    → shared types, constants, validation
packages/sdk       → React Native SDK (captures requests)
apps/bridge        → local Node.js bridge (receives + stores events)
apps/dashboard     → React web dashboard (displays events)
```

## Development

```bash
npm install              # install all workspace deps
npm run build:shared     # build shared types first
npm run build:sdk        # build SDK
npm run build            # build all
npm run typecheck        # typecheck all packages
npm run bridge           # start bridge (port 8347 by default)
npm run dashboard        # start dashboard (port 5173, host 0.0.0.0)
```

### E2E integration test

To verify all three layers work without a real RN app:

```bash
# Terminal 1 — start the bridge
npm run dev:bridge

# Terminal 2 — run the integration test
npm run test:e2e
```

The script sends a variety of events (happy path, 4xx errors, network failures,
slow requests, duplicates, 64 KB body) and then prints a summary. Open
`http://localhost:5173` while it runs to see events appear in real time.

Options:
```bash
node scripts/e2e-test.mjs --bridge http://localhost:8347 --count 20 --delay 300
```

## Sensitive Data Masking

The SDK automatically redacts sensitive header values before sending them to the bridge.
The default masked list covers: `authorization`, `cookie`, `set-cookie`,
`proxy-authorization`, `x-api-key`, `x-auth-token`.

Redacted values are replaced with `[REDACTED]` in both stored events and the dashboard.
The original value never leaves the device.

## Status

This project is under active development. See [docs/roadmap.md](docs/roadmap.md) for the current plan and [docs/progress/](docs/progress/) for per-layer status.

## Docs

- [Product Overview](docs/product-overview.md)
- [MVP Scope](docs/mvp-scope.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [AI Workflow](docs/workflow.md)
