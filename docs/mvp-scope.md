# MVP Scope

## MVP Goal

A developer installs the SDK, starts the bridge, opens the dashboard, and **sees every HTTP request their app makes in real time** with method, URL, status, duration, headers, and body.

One developer. One device. One session. Localhost only.

## In Scope

| Feature | Details |
|---|---|
| Fetch interception | Monkey-patch `global.fetch` in RN apps |
| Event normalization | Stable `NetworkEvent` schema shared across layers |
| Header masking | Redact values of sensitive headers (Authorization, Cookie, etc.) |
| HTTP transport | SDK POSTs events to bridge over localhost |
| In-memory storage | Bridge stores events in an array |
| WebSocket push | Bridge broadcasts new events to dashboard |
| Live request list | Table: method, URL, status, duration, timestamp |
| Request detail | Panel: headers, body, timing |
| Filters | By HTTP method and status code range |
| Session clear | Button to reset the event list |
| Single CLI command | `npx @network-tool/bridge` starts bridge + serves dashboard |

## Out of Scope (Deferred)

| Feature | Reason |
|---|---|
| XMLHttpRequest interception | Complexity; fetch covers most RN networking |
| Axios-specific interceptor | Defer dedicated adapter |
| Body field masking | Header masking is enough for MVP |
| Persistent storage | In-memory is fine for single-session |
| Multi-session / session history | One session at a time |
| Export (HAR, JSON) | Nice-to-have |
| Copy as cURL | Nice-to-have |
| Duplicate request detection | Post-MVP analytics |
| Slow request highlighting | Needs configurable thresholds |
| Screen/route tagging | Requires navigation integration |
| Cloud sync / team sharing | Explicitly excluded |
| Authentication | Localhost tool, not needed |
