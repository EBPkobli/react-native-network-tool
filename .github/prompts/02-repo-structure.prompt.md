---
mode: network-tool-agent
description: "Design the monorepo structure and package boundaries"
---

# 02 — Repository Structure

Design the repository structure for this product.

We want a clean workspace that supports:
- RN SDK package (`packages/sdk`)
- Local bridge service (`apps/bridge`)
- Dashboard app (`apps/dashboard`)
- Shared types (`packages/shared`)

Your task:
- Propose a monorepo structure
- Explain package boundaries
- Explain which parts should be shared vs isolated
- Recommend package names
- Recommend the initial tech stack for each layer
- Keep it simple and MVP-friendly

Constraints:
- Do not write full implementation yet
- Avoid unnecessary packages
- Avoid premature abstraction
- Optimize for incremental development

Output format:
1. Repo structure
2. Package responsibilities
3. Shared modules
4. Tech stack per layer
5. Initial file/folder tree
6. Implementation order
