# Layer 1 — SDK Progress

## Package: `packages/sdk`

### Status: ✅ Complete — ready for bridge integration

### Completed
- [x] Package structure (package.json, tsconfig.json)
- [x] `masking.ts` — maskHeaders(), maskEvent()
- [x] `transport.ts` — Transport interface, createHttpTransport()
- [x] `event-builder.ts` — buildEvent(), buildErrorEvent(), header/body helpers, ID generation
- [x] `index.ts` — NetworkInspector.init/disable/isEnabled, processEvent(), getConfig()
- [x] `interceptor.ts` — installInterceptor(), uninstallInterceptor(), bridge URL skip guard
- [x] Interceptor wired into init() and disable()
- [x] Build passes (7.75KB bundle)
- [x] Typecheck passes

### Not Started
- [ ] Axios adapter (post-MVP, prompt: 06-sdk-axios)
- [ ] SDK review (prompt: 07-sdk-review)

### Next Step
**Phase 3: Bridge** — use prompt `08-bridge-architecture.prompt.md`

### Decisions Made
1. Zero runtime dependencies — SDK uses only globals
2. Transport saves original fetch ref before patching (avoids infinite recursion)
3. Events are fire-and-forget (transport never blocks the app)
4. Header masking only for MVP (no body field masking)
5. UUID fallback for environments without crypto.randomUUID
