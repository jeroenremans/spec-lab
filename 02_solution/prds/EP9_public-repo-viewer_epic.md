# EP9 — Public Repository Viewer (Read-Only)

**Product:** Spec-Driven Development Workbench  
**Date:** 2026-06-07  
**Status:** Delivered — MVP implemented 2026-06-07

---

## Objective

Allow users to browse and read a public GitHub repository (by URL) directly in the workbench, without cloning. Read-only access — no editing, no tagging.

---

## Scope

- User enters a GitHub repository URL (e.g. `https://github.com/anthropics/skills`)
- App fetches file tree via GitHub API (public repos, no auth required)
- Markdown files rendered in the viewer
- Sidebar shows repo file tree, read-only
- No write operations; no git add, no save

## Out of Scope

- Private repositories (requires auth — v2)
- Editing or tagging files in remote repos
- Caching remote repos for offline use

---

## Dependencies

- GitHub REST API (`/repos/{owner}/{repo}/contents/`) — public access
- Rate limiting: unauthenticated API calls limited to 60 req/hour

---

## Risks

| Risk | Mitigation |
|------|-----------|
| GitHub API rate limiting for heavy browsing | Show rate limit status; add auth option in v2 |
| Large repos with deep trees | Lazy-load tree on folder expand |

---

## Status

Not scheduled. Captured from brainstorm `00_intake/brain-storm/ui_improvements.md`.
