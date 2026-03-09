---
mode: network-tool-agent
description: "Add dashboard features: detail panel, filters, clear session"
---

# 14 — Dashboard Features

Add the remaining MVP features to the dashboard.

Read the current dashboard code first — all files in `apps/dashboard/src/`.

Your task:
1. **RequestDetail panel** — click a row to see full headers, body, timing
2. **FilterBar** — filter by HTTP method and status code range (2xx/3xx/4xx/5xx)
3. **Clear session** — button that calls DELETE /api/events and clears local state
4. **Basic styling** — clean, readable layout suitable for a dev tool

Requirements:
- Detail panel shows: request headers, request body (formatted JSON), response headers, response body (formatted JSON), timing breakdown
- Filters are additive (method AND status)
- JSON bodies should be pretty-printed
- Layout: list on left/top, detail on right/bottom

Do NOT implement:
- Copy as cURL (post-MVP)
- Export (post-MVP)
- Duplicate detection (post-MVP)

Output format:
1. Goal
2. Files created/modified
3. Code
4. How to test
5. Next step
