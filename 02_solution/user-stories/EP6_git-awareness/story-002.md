# S6.2 — View what changed in a file

**Epic:** EP6 — Git Awareness  
**Priority:** Should-have

---

**As a** BA,  
**I want to** see an inline diff showing what changed in a spec file since the last commit,  
**so that** I can review changes before deciding to commit or continue editing.

**Acceptance intent:** "Changes" button appears on modified files. Clicking toggles an inline diff view: added blocks highlighted green, removed blocks red. Clicking again restores the normal view. A "Changes" sidebar section lists all modified `.md` files with +/- stats.

**Dependencies:** S6.1.

**Non-goals:** Side-by-side diff view; commit authoring; reverting changes.
