# S3.9 — Hover tooltip on sidebar files

**Epic:** EP3 — File Navigation & Sidebar  
**Priority:** Nice-to-have

---

**As a** team member,  
**I want** a tooltip to appear when hovering over a file in the sidebar,  
**so that** I can see the full path and a summary of the file without opening it.

**Acceptance intent:** Tooltip shows full relative path and (if cached) open tag count. Appears after 400ms hover delay. Does not obstruct adjacent files. Dismissed on mouse leave.

**Dependencies:** S3.1; tag data available in state.

**Non-goals:** File content preview in tooltip; async file fetch on hover.
