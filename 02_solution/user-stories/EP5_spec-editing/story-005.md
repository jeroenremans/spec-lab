# S5.5 — Auto-stage new files with git add

**Epic:** EP5 — Spec Editing  
**Priority:** Should-have

---

**As a** BA,  
**I want** newly created files to be automatically staged (`git add`) after creation,  
**so that** they appear in the sidebar as tracked new files and are included in the next commit.

**Acceptance intent:** After creating a new file via S5.4, the backend runs `git add <file>` in the project root. File appears in the sidebar with a "new" indicator (consistent with existing git-modified indicators). If the project is not a git repo, the step is skipped silently — no error.

**Dependencies:** S5.4; S6.1 (git awareness infrastructure).

**Non-goals:** Auto-commit; staging existing files; git add on save of existing files.
