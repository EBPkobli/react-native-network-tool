---
mode: network-tool-agent
description: "Review the complete SDK layer for bugs, gaps, and quality"
---

# 07 — SDK Review

Do a full review of the SDK layer (`packages/sdk`).

Read ALL files in `packages/sdk/src/` and `packages/shared/src/`.

Check for:
1. **Correctness** — Does the fetch interceptor work? Are edge cases handled?
2. **Safety** — Can the SDK crash the host app? Are all externals try/caught?
3. **Infinite loop** — Is bridge-bound traffic properly excluded from interception?
4. **Memory** — Are response clones cleaned up? Any leak potential?
5. **Types** — Any `any` types? Strict mode violations?
6. **Production safety** — Does `enabled: false` truly result in zero overhead?
7. **API surface** — Is the public API minimal and clean?

Output format:
1. Summary of reviewed files
2. Issues found (critical / medium / low)
3. Recommended fixes (with code if needed)
4. Verdict: ready for Layer 2 or not?
