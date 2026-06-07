# Spec Workbench — Acceptance Criteria: EP6 — Git Awareness

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

---

## EP6 — Git Awareness

### S6.1 — See which files have uncommitted changes

**AC-6.1.1 — Orange dot on modified file**
- **Given** a `.md` file has uncommitted changes in git
- **When** the sidebar renders
- **Then** that file shows an orange dot indicator; all parent folder sections are also marked

**AC-6.1.2 — Indicator clears after revert**
- **Given** a file showed an orange dot (had uncommitted changes)
- **When** the changes are reverted externally (e.g., `git checkout`) and the user clicks "Refresh"
- **Then** the orange dot disappears from the file and its parent folders

**AC-6.1.3 — Indicator updates after save**
- **Given** a file had no indicator before editing
- **When** the user edits and saves the file in-app
- **Then** the orange dot appears on that file within 2 seconds of saving

**AC-6.1.4 — Git unavailable**
- **Given** git is not installed or not in PATH
- **When** the sidebar loads
- **Then** no orange dots appear; a notice is shown: "Git not available — change indicators disabled"; no crash

**AC-6.1.5 — New untracked file**
- **Given** a new file has been created but never committed
- **When** the sidebar loads
- **Then** the file shows an orange dot (treated as modified/new)

**AC-6.1.6 — Detached HEAD state**
- **Given** the project repo is in a detached HEAD state
- **When** the sidebar loads
- **Then** git status still runs and returns modified files correctly; no crash

---

### S6.2 — View what changed in a file

**AC-6.2.1 — Changes button appears on modified files only**
- **Given** a file has uncommitted changes
- **When** it is opened in the viewer
- **Then** a "Changes" button is visible in the page actions area

**AC-6.2.2 — Changes button absent on unmodified files**
- **Given** a file has no uncommitted changes
- **When** it is opened
- **Then** no "Changes" button is shown

**AC-6.2.3 — Inline diff renders**
- **Given** the user clicks "Changes" on a modified file
- **When** the diff loads
- **Then** added lines/paragraphs are highlighted green; removed lines/paragraphs are highlighted red; unchanged content renders normally

**AC-6.2.4 — Toggle off restores normal view**
- **Given** the diff view is active
- **When** the user clicks "Changes" again
- **Then** the normal rendered markdown view is restored; no page reload required

**AC-6.2.5 — No previous commit (file is new)**
- **Given** a file has never been committed
- **When** the user opens it and clicks "Changes"
- **Then** a notice is shown: "No previous version to compare — file has not been committed yet"; no crash

**AC-6.2.6 — Changes sidebar section**
- **Given** three `.md` files have uncommitted changes
- **When** the sidebar loads
- **Then** the "Changes" collapsible section lists all three with `+N −N` stats; clicking one opens it with the diff view active

---
