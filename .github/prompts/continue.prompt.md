---
mode: network-tool-agent
description: "Resume work from where it was interrupted"
---

# Continue

Continue from the current phase without restarting the project.

Rules:
1. Do NOT repeat previous architecture or design decisions
2. Read `docs/progress/` files to understand current state
3. Summarize completed work in ≤5 bullets
4. Identify the single next unfinished step
5. Continue only with that step
6. Preserve existing contracts unless there is a critical flaw
7. After completing the step, update the relevant progress doc

If you are unsure what the next step is:
- Check `docs/roadmap.md` for the phase plan
- Check `docs/progress/layer-*.md` for status of each layer
- Check `docs/progress/` for the most recently updated file
- Pick the next incomplete task from the roadmap
