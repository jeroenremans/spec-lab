# S3.5 — Sidebar collapse state persists on reload

**Epic:** EP3 — File Navigation & Sidebar  
**Priority:** Must-have

---

**As a** team member,  
**I want** the left navigation sidebar to remain in the same open/collapsed state after a page reload,  
**so that** my workspace layout is not disrupted every time I refresh the browser.

**Acceptance intent:** If the sidebar is open before reload, it is open after reload. If collapsed, it stays collapsed. State is restored before the first paint — no visible flash of collapsed/open. Applies to both the sidebar itself and any expanded folder nodes within the tree.

**Dependencies:** S3.1.

**Non-goals:** Syncing sidebar state across browser tabs; per-project sidebar state.
