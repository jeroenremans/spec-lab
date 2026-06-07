# S6.1 — See which files have uncommitted changes

**Epic:** EP6 — Git Awareness  
**Priority:** Should-have

---

**As a** BA,  
**I want** files with uncommitted changes to be visually marked in the sidebar,  
**so that** I always know what has been modified but not yet committed.

**Acceptance intent:** Modified files show an orange dot. All parent folders of modified files are also marked. Indicator updates automatically after every save. If git is unavailable, indicators are hidden with a notice — no crash.

**Dependencies:** S2.2 (active project is a git repo); EP1 (git in PATH).

**Non-goals:** Commit, push, or pull from the app; staging individual files.
