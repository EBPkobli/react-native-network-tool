# Product Overview

## What We're Building

A **local network inspector for React Native apps**. Developers add our SDK to their app, start a local bridge service, and see every HTTP request in a web dashboard — in real time.

## Why

React Native lacks good built-in network debugging. Chrome DevTools network tab doesn't work reliably with RN. Flipper is being deprecated. Developers need a simple, focused tool.

## Who It's For

React Native developers debugging network issues during local development. One developer, one device, one machine.

## What It Is NOT

- Not a cloud service
- Not a team collaboration tool
- Not a production monitoring tool
- Not a proxy (doesn't intercept at network level — intercepts at JS level)
- Not a general HTTP client (like Postman)

## Three Layers

### 1. SDK (`packages/sdk`)
An npm package installed in the RN app. Intercepts `fetch` calls, normalizes them into events, masks sensitive headers, and sends them to the bridge.

### 2. Bridge (`apps/bridge`)
A local Node.js service. Receives events from the SDK, stores them in memory, and pushes them to the dashboard via WebSocket.

### 3. Dashboard (`apps/dashboard`)
A React web app. Shows a live list of captured requests with filtering, detail inspection, and session management.

## Core User Flow

1. Developer adds SDK to their RN app (one `init()` call)
2. Developer starts the bridge (`npx @network-tool/bridge`)
3. Developer opens `http://localhost:8347` in browser
4. Developer uses their app normally
5. Every fetch request appears in the dashboard in real time
6. Developer clicks a request to see headers, body, timing
7. Developer filters by method or status code
