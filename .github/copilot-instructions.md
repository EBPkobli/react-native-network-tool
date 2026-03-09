# Global Copilot Instructions — Network Inspector Tool

## What This Is

A React Native-only local network inspection tool with 3 layers:
1. **RN SDK** (`packages/sdk`) — captures fetch requests in RN apps
2. **Local Bridge** (`apps/bridge`) — Node.js service that receives and stores events
3. **Web Dashboard** (`apps/dashboard`) — browser UI for inspecting requests

This is a **local developer tool**, not a cloud product. No auth, no teams, no SaaS.

## Monorepo Layout

```
packages/shared    → shared types, constants, validation (zero deps)
packages/sdk       → RN SDK package (depends on shared)
apps/bridge        → Node.js bridge service (depends on shared)
apps/dashboard     → React + Vite SPA (depends on shared types at build time)
```

## Working Rules — ALWAYS Follow These

### 1. Phase discipline
- Work only on the current phase. Never build all layers at once.
- Check `docs/progress/` files to understand current status before starting.
- Check `docs/roadmap.md` for the full phase plan.

### 2. Before writing code, state:
1. **Goal** — what this step achieves
2. **Scope** — which files will be created or changed
3. **Risks** — what could go wrong

### 3. After writing code, state:
1. **Files changed** — list of created/modified files
2. **What changed** — one sentence per file
3. **How to test** — concrete commands or steps
4. **Next step** — what should be done next

### 4. If interrupted or resuming
- Do NOT restart from scratch
- Read `docs/progress/` to find current state
- Summarize completed work in ≤5 bullets
- Identify the single next unfinished step
- Continue only with that step

### 5. Code style
- Keep files small and focused (one module = one concern)
- No unnecessary abstractions
- No premature optimization
- No dependencies unless truly needed
- TypeScript strict mode everywhere

### 6. Contracts
- The `NetworkEvent` type in `packages/shared/src/types.ts` is the single source of truth
- Never change shared contracts without explicitly calling it out
- All layers consume shared types — changes ripple everywhere

### 7. Forbidden
- No cloud features, authentication, billing, or team features
- No massive monolithic files
- No silent contract changes
- No `any` types
- No skipping error handling at system boundaries


Phase rule:

Never start the next phase before finishing the current one.

If a new prompt starts another phase:

1. stop execution
2. identify the correct phase
3. roll back to that phase
4. continue from the unfinished step