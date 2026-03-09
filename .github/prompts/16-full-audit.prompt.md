---
mode: network-tool-agent
description: "Full MVP audit across all 3 layers"
---

# 16 — Full Audit

Do a full MVP audit of the entire product.

Read all source files across:
- `packages/shared/src/`
- `packages/sdk/src/`
- `apps/bridge/src/`
- `apps/dashboard/src/`

Your task:
- Review all 3 layers together
- Identify architectural weak points
- Identify DX problems
- Identify missing MVP essentials
- Identify security/privacy concerns (masking, data exposure)
- Identify reliability issues
- Recommend the smallest set of improvements needed before a first public demo

Constraints:
- Do not suggest cloud/SaaS features
- Do not overengineer
- Keep recommendations practical and prioritized

Output format:
1. Summary of current state
2. Critical fixes (must do before demo)
3. Medium improvements (should do soon)
4. Nice-to-have (defer)
5. Final MVP readiness verdict
