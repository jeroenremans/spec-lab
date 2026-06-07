# NFR — Reliability

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

---

## 4. Reliability

### NFR-R1 — Graceful degradation without git
- **Requirement:** If git is not installed or not in PATH, the app must start and remain fully usable for file viewing and editing. Git-dependent features (orange dots, diff view, Changes section) are hidden with a visible notice. No crash.
- **Measurable:** Start app with git removed from PATH → app loads; all non-git features work.

### NFR-R2 — Graceful degradation with corrupt config
- **Requirement:** If the project config file is malformed or missing, the app starts with an empty project list and shows a recovery notice. The corrupt file is not silently overwritten; it is renamed as `.bak` before reset.
- **Measurable:** Corrupt config JSON → app starts → `.bak` file created → clean config initialized.

### NFR-R3 — No crash on malformed content
- **Requirement:** Opening any file type (malformed markdown, invalid VTT, broken JSON, invalid Mermaid) must never produce an unhandled exception or blank screen. All errors must display a user-readable message in the content area.
- **Measurable:** Test suite covers at least: empty file, binary file, 1MB markdown, invalid VTT, broken Mermaid.

### NFR-R4 — Editor data preservation on save failure
- **Requirement:** If a save operation fails (disk full, read-only, permission denied), the editor must remain open with the user's unsaved content intact. No content is lost on save failure.
- **Measurable:** Simulate disk-full condition → save fails → editor still shows content.

### NFR-R5 — Recovery from project path deletion
- **Requirement:** If a registered project's directory is deleted externally between sessions, the app starts without error, shows the project in the switcher with a "Not found" badge, and does not remove it from the list automatically.
- **Measurable:** Delete project dir → restart app → project shown with error badge.

### NFR-R6 — Session persistence reliability
- **Requirement:** Project list and last-opened file are written to the config file synchronously on change (not only on app exit), so restarts after a crash do not lose state.
- **Measurable:** Kill the process mid-session → restart → last project and file restored.

---
