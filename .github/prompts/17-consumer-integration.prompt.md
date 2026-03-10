---
mode: network-tool-agent
description: "Integrate React Native Network Inspector into an external React Native app"
---

# Consumer Integration

Integrate React Native Network Inspector into this React Native project with the smallest possible app-side change.

## Goal

After your changes:

1. The app imports `react-native-network-sdk`
2. The app initializes the SDK with a single startup call
3. The developer can run `react-native-network-bridge` on their machine
4. Network requests appear in the browser dashboard

## Required App-Side Integration

Use this exact integration unless there is a concrete project-specific reason not to:

```ts
import { initDevNetworkInspector } from 'react-native-network-sdk';

initDevNetworkInspector();
```

## Rules

1. Do not reimplement the SDK manually
2. Do not write a custom fetch monkey-patch
3. Do not copy SDK internals into the app
4. Put the initialization in the earliest safe startup file
5. Preserve existing app behavior
6. Keep changes minimal and production-safe
7. Prefer the default zero-config call unless the project clearly needs custom bridge settings

## Where To Add It

Choose the earliest safe startup location:

- `index.js`
- `index.ts`
- `App.tsx`
- root bootstrap file
- any app entry module that runs once at startup

If multiple entry files exist, pick the one that is guaranteed to run once.

## Installation

Install the SDK dependency:

```bash
npm install react-native-network-sdk
```

## Host Machine Usage

Do not import the bridge package into the app.

The bridge runs separately on the developer machine:

```bash
npx react-native-network-bridge
```

If the project wants a reusable script, suggest one of these:

React Native CLI:

```json
{
  "scripts": {
    "network:bridge": "bridge",
    "dev": "concurrently \"npm run network:bridge\" \"react-native start\""
  }
}
```

Expo:

```json
{
  "scripts": {
    "network:bridge": "bridge",
    "dev": "concurrently \"npm run network:bridge\" \"expo start\""
  }
}
```

## Connectivity Notes

- iOS simulator usually works with defaults
- Android emulator may need:

```bash
adb reverse tcp:8347 tcp:8347
```

- Physical devices may need:

```ts
initDevNetworkInspector({
  bridgeHost: 'YOUR_LOCAL_IP',
});
```

## What To Report Back

When done:

1. State which file was changed
2. Show the exact SDK initialization that was added
3. Mention how the developer should run the bridge
4. Mention any Android emulator or physical-device caveats if relevant
