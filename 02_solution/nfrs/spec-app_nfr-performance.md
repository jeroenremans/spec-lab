# NFR — Performance

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

---

## 1. Performance

### NFR-P1 — App startup time
- **Requirement:** Server starts and is ready to accept requests within **10 seconds** of running the start command on a standard developer machine (8GB RAM, SSD).
- **Measurable:** Timed from command execution to first successful HTTP response on port 3301.
- **Rationale:** Users start the app at the beginning of a work session; slow startup causes friction.

### NFR-P2 — File tree load time
- **Requirement:** The sidebar file tree for a project with up to **500 files** across all folders renders within **1 second** of project selection.
- **Measurable:** Measured from project switch click to full tree paint in browser.
- **Rationale:** PRD explicitly targets repos up to 500 files; beyond that is out of scope for v1.

### NFR-P3 — Markdown render time
- **Requirement:** Any `.md` file up to **200KB** renders in the viewer within **200ms** of file selection.
- **Measurable:** Browser performance mark from file click to `DOMContentLoaded` of rendered content.
- **Unknown:** Files larger than 200KB are not explicitly addressed. Behaviour for large files must be defined in v2 (lazy render or size warning).

### NFR-P4 — Save latency
- **Requirement:** Clicking "Save" in the editor results in the file being written to disk and the git status refreshing within **2 seconds**.
- **Measurable:** Time from Save button click to visible git dot update in sidebar.

### NFR-P5 — Git status refresh
- **Requirement:** Git status is fetched and sidebar indicators update within **2 seconds** of a save event or manual refresh click.
- **Measurable:** Timed from save/refresh trigger to orange dot render update.

### NFR-P6 — Search responsiveness
- **Requirement:** File tree search filters results with no perceptible delay (target: **< 50ms** per keystroke) for repos up to 500 files.
- **Measurable:** Measured via browser `input` event to DOM update time.

### NFR-P7 — Concurrent use
- **Requirement:** The Flask backend must handle **1 concurrent user** reliably. Multi-user concurrency is out of scope for v1.
- **Unknown:** If colleagues share a machine or run on a shared network, concurrent request handling is undefined. Flag for v2.

---
