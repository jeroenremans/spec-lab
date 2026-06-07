# S3.8 — Collapsible folder tree nodes

**Epic:** EP3 — File Navigation & Sidebar  
**Priority:** Should-have

---

**As a** team member,  
**I want** to collapse and expand individual folders in the file tree,  
**so that** I can hide phases I am not working on and focus on the relevant part of the spec.

**Acceptance intent:** Each folder node has a collapse/expand toggle (arrow icon). Collapsed folders hide their children. Expanded/collapsed state per folder persists in localStorage across reloads. Default: top-level phase folders expanded; subfolders collapsed.

**Dependencies:** S3.1; S3.5 (same localStorage persist pattern).

**Non-goals:** Collapse-all / expand-all button (v2); per-project state.
