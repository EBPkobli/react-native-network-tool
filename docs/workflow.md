# AI Workflow Guide

## How This Repo Works With Copilot

This repository is designed for **phase-by-phase AI-assisted development** using GitHub Copilot in VS Code. The workflow is:

1. Open a numbered prompt file
2. Run it in Copilot Chat (use the `network-tool-agent` mode)
3. Copilot follows the instructions, writes code, and reports what changed
4. You review and approve
5. Progress docs are updated
6. Move to the next prompt

## File Locations

| Type | Location | Purpose |
|---|---|---|
| Global rules | `.github/copilot-instructions.md` | Always-active behavior rules |
| Layer rules | `.github/instructions/*.instructions.md` | Auto-applied when editing that layer's files |
| Prompts | `.github/prompts/*.prompt.md` | Step-by-step build prompts |
| Progress | `docs/progress/layer-*.md` | Per-layer status tracking |
| Roadmap | `docs/roadmap.md` | Overall phase plan |

## Prompt Sequence

Run prompts in order. Each prompt builds on the output of the previous one.

```
01-mvp              → define scope (done)
02-repo-structure   → design structure (done)
03-sdk-architecture → design SDK (done)
04-sdk-foundation   → build SDK core (done)
05-sdk-fetch        → build fetch interceptor ← CURRENT NEXT STEP
06-sdk-axios        → optional axios adapter
07-sdk-review       → audit SDK quality
08-bridge-arch      → design bridge
09-bridge-found     → build bridge
10-bridge-api       → refine bridge API
11-bridge-review    → audit bridge
12-dashboard-arch   → design dashboard
13-dashboard-found  → scaffold dashboard
14-dashboard-feat   → add features
15-e2e-integration  → test full flow
16-full-audit       → final review
continue            → resume after interruption
```

## Resuming After Interruption

If the AI gets stuck or a session ends mid-task:

1. Open `.github/prompts/continue.prompt.md`
2. Run it in Copilot Chat
3. Copilot will:
   - Read progress docs
   - Summarize what's done
   - Identify the next step
   - Continue from there

## Rules Copilot Follows

- Works one phase at a time
- States goal/scope/risks before coding
- States files changed/how to test after coding
- Never silently changes shared contracts
- Never builds all layers at once
- Fails silently in SDK (never crashes host app)
- Validates input in bridge (never trusts SDK blindly)
