# NFR — Observability

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

---

## 5. Observability

### NFR-O1 — Startup log
- **Requirement:** On startup, the terminal must print: app version, active port, config file path, and number of registered projects. Format must be human-readable.
- **Example output:**
  ```
  Spec Workbench v1.0.0
  Serving at http://localhost:3301
  Config: ~/.spec-app/config.json
  Projects: 2 registered
  ```

### NFR-O2 — Request logging
- **Requirement:** The Flask server must log each HTTP request with: method, path, status code, and response time in milliseconds. Log level: INFO. Logged to stdout only (no log files written by default).
- **Rationale:** Enables debugging without requiring log file cleanup.

### NFR-O3 — Git command logging
- **Requirement:** Each git command executed by the backend must be logged at DEBUG level with: the command run, the project path, and the exit code. Not logged at INFO to avoid noise in normal use.

### NFR-O4 — Error logging
- **Requirement:** All unhandled exceptions in the backend must be caught, logged at ERROR level with full stack trace, and returned to the frontend as a structured JSON error (not a raw 500 HTML page).
- **Measurable:** Trigger a backend exception → frontend shows error message → terminal shows stack trace.

### NFR-O5 — Frontend error visibility
- **Requirement:** JavaScript errors in the frontend that affect user-visible features must display a user-facing error message in the content area (not just in the browser console). Errors that do not affect visible features may be console-only.

### NFR-O6 — No monitoring infrastructure required
- **Assessment:** Given the local-only nature of the app, no external monitoring (Datadog, Sentry, etc.) is required or desired for v1. Observability is limited to terminal output and browser devtools.
- **Unknown:** If we+ wants to track adoption across teams, a lightweight local usage log (opt-in) could be added in v2. Out of scope for v1.

---
