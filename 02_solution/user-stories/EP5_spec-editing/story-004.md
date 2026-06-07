# S5.4 — Create new markdown files and folders from the app

**Epic:** EP5 — Spec Editing  
**Priority:** Should-have

---

**As a** BA,  
**I want** to create new `.md` files and subfolders directly from the workbench,  
**so that** I can start a new spec artifact without leaving the app and opening a terminal or file explorer.

**Acceptance intent:** Sidebar shows a "+" button per folder. Clicking prompts for a name. New file is created on disk, immediately appears in the tree, and auto-selects for editing. New folder appears in tree without a file. Name validation: no special characters except `_` and `-`; `.md` added automatically for files.

**Dependencies:** S5.1 (edit infrastructure); S1.1 (Flask backend with write access).

**Non-goals:** Templates for new files; folder deletion from UI; file renaming or moving.
