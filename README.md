# React Native Network Inspector

React Native Network Inspector is a local development tool for React Native apps.

It has two parts:

- `react-native-network-sdk`: installed inside the React Native app
- `react-native-network-bridge`: run on the developer machine

The SDK captures network activity from the app. The bridge receives those events, serves the dashboard, and opens the browser UI.

## What Developers Actually Do

A developer using this tool does not import both packages into the app.

They do this instead:

1. Install `react-native-network-sdk` in the React Native app
2. Add one line in app startup code
3. Run `react-native-network-bridge` on the development machine
4. Inspect requests in the dashboard

## Roles

### `react-native-network-sdk`

This package belongs inside the React Native project.

It is responsible for:

- intercepting `fetch`
- collecting request and response data
- masking sensitive headers
- sending events to the bridge

App-side usage:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector();
```

### `react-native-network-bridge`

This package runs on the host machine, not inside the mobile app.

It is responsible for:

- accepting incoming events from the SDK
- storing events in memory
- exposing HTTP and WebSocket endpoints
- serving the dashboard UI
- opening the dashboard in the browser

Host-side usage:

```bash
npx react-native-network-bridge
```

Important:

- the app imports the SDK
- the app does not import the bridge
- the bridge is started as a local command

## Why This Split Exists

The mobile app cannot directly start a process on the developer machine.

Because of that, the system must be split into:

- code that runs inside the app
- a local process that runs on the host machine

That is why both pieces exist.

## Runtime Flow

```text
React Native App
  -> SDK intercepts fetch calls
  -> SDK POSTs events to the local bridge
  -> Bridge stores events and broadcasts updates
  -> Dashboard renders requests in real time
```

## Installation

### 1. Install the SDK in the React Native app

```bash
npm install react-native-network-sdk
```

Add this once in your app entry file:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector();
```

Good places for that call:

- `index.js`
- `index.ts`
- `App.tsx`
- any root bootstrap file

### 2. Run the bridge on the development machine

Without installing globally:

```bash
npx react-native-network-bridge
```

Or install it in the project:

```bash
npm install -D react-native-network-bridge
```

Then run:

```bash
bridge
```

## Recommended Consumer Scripts

If you want the bridge to start together with the app development command, add a host-side script in the consumer project.

React Native example:

```json
{
  "scripts": {
    "network:bridge": "bridge",
    "dev": "concurrently \"npm run network:bridge\" \"react-native start\""
  }
}
```

Expo example:

```json
{
  "scripts": {
    "network:bridge": "bridge",
    "dev": "concurrently \"npm run network:bridge\" \"expo start\""
  }
}
```

This is the correct way to make the dashboard come up when developers start working.

## Default Developer Experience

The intended default workflow is:

1. Add `initDevNetworkInspector()` to the app
2. Start the app normally
3. Run `npx react-native-network-bridge`
4. Let the browser open automatically
5. Inspect requests in the dashboard

## Optional SDK Configuration

The default app integration should usually be:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector();
```

If needed, the SDK can still be configured:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector({
  bridgeUrl: 'http://localhost:8347',
  maskedHeaders: ['authorization', 'cookie', 'x-api-key'],
  maxBodySize: 65_536,
});
```

## Architecture

### SDK layer

Location: `packages/sdk`

Responsibilities:

- patch `fetch`
- build normalized network events
- redact sensitive headers
- send events to the bridge

### Bridge layer

Location: `apps/bridge`

Responsibilities:

- expose `/health`
- expose `/api/events`
- expose `/ws`
- manage in-memory sessions and event storage
- serve the embedded dashboard

### Dashboard layer

Location: `apps/dashboard`

Responsibilities:

- connect to the bridge
- hydrate existing events
- listen for live updates
- render request details and filters

The dashboard is not meant to be imported into the mobile app. It is served by the bridge.

## Infrastructure Model

This tool is local-first.

The expected infrastructure is:

- one developer machine
- one bridge process
- one browser tab
- one simulator or physical device

There is no cloud backend in the intended setup.

## Device Connectivity

### iOS simulator

Usually no extra setup is needed.

### Android emulator

Run:

```bash
adb reverse tcp:8347 tcp:8347
```

### Physical device

If needed, point the SDK at your machine's LAN IP:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector({
  bridgeHost: '192.168.1.42',
});
```

## Sensitive Data Masking

Sensitive headers are redacted before events leave the app.

Default masked headers include:

- `authorization`
- `cookie`
- `set-cookie`
- `proxy-authorization`
- `x-api-key`
- `x-auth-token`

Masked values appear as `[REDACTED]`.

## Local Development In This Repo

```bash
npm install
npm run build:dashboard
npm run build:bridge
npm run dev:bridge
npm run dev:dashboard
```

Additional commands:

```bash
npm run build:shared
npm run build:sdk
npm run build:bridge
npm run build:dashboard
npm run build
npm run typecheck
npm run test:e2e
```

Notes:

- `apps/bridge` bundles a dashboard snapshot into the published bridge package
- `apps/dashboard` is the dashboard source app used during repo development
- `packages/sdk` is the package intended to be imported by consumer apps

## Repo Layout

```text
packages/shared      shared types, constants, validation
packages/sdk         React Native SDK
apps/bridge          local bridge service
apps/dashboard       dashboard source
examples/test-app    Expo sample app
docs/                product and engineering docs
```

## Documentation Guide

Additional documentation:

| File | Purpose |
| --- | --- |
| `docs/product-overview.md` | Product direction |
| `docs/mvp-scope.md` | Scope boundaries |
| `docs/architecture.md` | Internal architecture notes |
| `docs/roadmap.md` | Planned work |
| `docs/progress/layer-1-sdk.md` | SDK progress |
| `docs/progress/layer-2-bridge.md` | Bridge progress |
| `docs/progress/layer-3-dashboard.md` | Dashboard progress |
| `docs/progress/phase-6-integration.md` | Integration notes |
| `docs/workflow.md` | AI-assisted workflow |
