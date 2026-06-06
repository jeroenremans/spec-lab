# Spec-Driven Development Workbench — Non-Functional Requirements

**Derived from:** `spec-app_PRD.md` v0.2  
**Date:** 2026-06-06  
**Author:** Solution Architect / Quality Engineer role  
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

## 2. Security

### NFR-S1 — Local-only execution
- **Requirement:** The Flask server **must not** bind to `0.0.0.0` (all interfaces) by default. It must bind to `127.0.0.1` only, making it inaccessible from other machines on the network.
- **Rationale:** Spec files may contain confidential client information. Exposing the server on the local network without auth would be a data leak risk.

### NFR-S2 — No remote code execution
- **Requirement:** The backend must never execute arbitrary shell commands derived from user input. Git commands must use a fixed, parameterized allow-list of operations (`git status`, `git diff`, `git show`). No user-supplied strings may be passed directly to `subprocess.shell=True`.
- **Measurable:** Code review verification; no `shell=True` with user-controlled input.

### NFR-S3 — Path traversal prevention
- **Requirement:** All file read/write endpoints must validate that the requested path is within the registered project directory. Requests with `../` sequences or absolute paths outside the project root must be rejected with HTTP 403.
- **Measurable:** Automated test: request `../../etc/passwd` → expect 403.

### NFR-S4 — No eval of untrusted content
- **Requirement:** The frontend must not use `eval()` or `new Function()` on file content. Mermaid rendering must use the library's safe rendering API only.
- **Measurable:** Code review; CSP header blocks inline eval.

### NFR-S5 — Content Security Policy
- **Requirement:** The app must serve a `Content-Security-Policy` header that:
  - Restricts `script-src` to `'self'`
  - Disallows `unsafe-inline` scripts
  - Disallows external resource loading (no CDN at runtime)
- **Unknown:** Mermaid's rendering engine may require `unsafe-eval` for its internal compiler. This must be investigated and documented. If required, scope it to the Mermaid iframe/sandbox only.

### NFR-S6 — File write scope
- **Requirement:** The `PUT` save endpoint must only accept writes to `.md` files within the active project directory. Writes to any other file type or path must be rejected.
- **Measurable:** Test: attempt PUT to a `.py` or `.sh` file → expect 403.

### NFR-S7 — Dependency security
- **Requirement:** Python and npm dependencies must have no known **critical or high** CVEs at time of initial release. A `pip audit` and `npm audit` check must pass as part of the build process.
- **Measurable:** CI gate: `pip audit` and `npm audit --audit-level=high` both return 0 findings.

---

## 3. Privacy

### NFR-PR1 — No telemetry
- **Requirement:** The app must collect **zero** usage data, telemetry, crash reports, or analytics. No pings to external services of any kind at runtime.
- **Measurable:** Network tab inspection during full app usage session shows zero external requests.

### NFR-PR2 — No PII stored
- **Requirement:** The app stores only: registered project paths (local filesystem paths) and last-opened file path. No usernames, email addresses, IP addresses, or any other personal data are stored.
- **Measurable:** Inspect config file on disk — must contain only paths and timestamps.

### NFR-PR3 — No cloud calls
- **Requirement:** The app makes no requests to any cloud API, analytics endpoint, or update server at runtime. All functionality is purely local.
- **Measurable:** Network monitoring during full session; zero external HTTP requests.

### NFR-PR4 — GDPR applicability**
- **Assessment:** Because the app stores no PII and operates fully locally with no server-side data processing, GDPR obligations are **minimal** for v1.
- **Unknown:** If colleagues' names appear in spec files (e.g., meeting minutes), those files are stored on local git repos — not in the app's database. GDPR obligations for those files rest with the repo owner, not the app. Legal confirmation recommended before onboarding client project data.

### NFR-PR5 — Spec content confidentiality
- **Requirement:** The app must not log or cache file content outside the active session. No spec text is written to app logs, temp files, or browser localStorage.
- **Unknown:** Browser session storage or IndexedDB usage by EasyMDE or marked.js must be verified. Flag for dependency audit.

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

## 6. Accessibility

### NFR-A1 — WCAG 2.1 AA compliance target
- **Requirement:** The app targets **WCAG 2.1 Level AA** compliance for all interactive UI elements.
- **Unknown:** Full WCAG audit is not planned for v1 given the internal tool context. However, the following specific criteria are non-negotiable:

### NFR-A2 — Color contrast
- **Requirement:** All text and interactive elements must meet WCAG AA contrast ratios:
  - Normal text: minimum **4.5:1**
  - Large text (18pt+ or 14pt bold): minimum **3:1**
- **Measurable:** Verified via browser accessibility inspector or axe-core scan on main views.

### NFR-A3 — Keyboard navigation
- **Requirement:** The sidebar file tree, filter chips, nav switcher, and editor toolbar must be fully navigable by keyboard (Tab, Enter, Arrow keys). No mouse-only interactions for core workflows.
- **Measurable:** Complete the core BA workflow (open project → browse → open file → edit → save) without touching the mouse.

### NFR-A4 — Focus indicators
- **Requirement:** All interactive elements must have a visible focus ring when navigated via keyboard. No `outline: none` without a custom focus style.
- **Measurable:** Tab through all interactive elements; focus ring visible at each stop.

### NFR-A5 — Screen reader basics
- **Requirement:** Page landmarks (`<nav>`, `<main>`, `<aside>`), headings hierarchy, and button labels must be correct so screen readers can announce the UI structure meaningfully.
- **Unknown:** Full screen reader testing (VoiceOver, NVDA) is not planned for v1. Flag for v2 if accessibility is a requirement for specific colleagues.

### NFR-A6 — Tag color badges — not color-only
- **Requirement:** Review tag badges (TODO / REVIEW / REWORK / CLARIFY / COMMENT) must convey type not only by color but also by label text. Users who are color-blind must be able to distinguish tag types.
- **Measurable:** Tag type is always shown as text; verified with color-blindness simulation filter.

---

## 7. Compliance

### NFR-C1 — Open source license compliance
- **Requirement:** All bundled dependencies (EasyMDE, marked.js, Mermaid, Flask, and transitive deps) must have licenses compatible with internal tooling use (MIT, Apache 2.0, BSD). No GPL-licensed dependencies that would affect distribution.
- **Measurable:** `license-checker` (npm) and `pip-licenses` (Python) run at build time; report reviewed before release.
- **Unknown:** EasyMDE is MIT. Mermaid is MIT. marked.js is MIT. Flask is BSD. Confirm transitive dependencies before first release.

### NFR-C2 — No regulated data handling
- **Assessment:** The app itself does not handle regulated data (no PII, no financial data, no health data). Compliance obligations (GDPR, ISO 27001, etc.) apply to the **content of spec files** stored in git repos, which are managed by the repo owner — not by this app.
- **Unknown:** If the app is used on a project subject to ISO 27001 controls, the client's information security team must approve local-only tooling. Flag for project-specific review.

### NFR-C3 — we+ internal tool classification
- **Assessment:** This app is an internal productivity tool. It does not process customer data and is not externally distributed. Standard we+ internal tool approval process applies.
- **Unknown:** Confirm with we+ IT/security whether internal tools require a formal security review before rolling out to colleagues. Assumption: informal review sufficient for v1 pilot.

### NFR-C4 — No export control restrictions
- **Assessment:** The app contains no encryption algorithms beyond what is built into standard HTTPS/TLS (which is not used here — local HTTP only). No export control (EAR, ITAR) restrictions apply.

---

## 8. Flagged Unknowns — Summary

| # | Unknown | Impact | Recommended action |
|---|---------|--------|--------------------|
| U1 | Mermaid may require `unsafe-eval` in CSP | Security | Investigate Mermaid CSP requirements before release |
| U2 | EasyMDE/marked.js localStorage or IndexedDB usage | Privacy | Audit dependency storage behaviour |
| U3 | Files > 200KB render performance | Performance | Define size limit or lazy-load strategy in v2 |
| U4 | Multi-user / concurrent use behaviour | Performance | Document as unsupported in v1 README |
| U5 | GDPR obligations for spec files containing names | Privacy | Confirm with legal before client project onboarding |
| U6 | we+ internal tool approval process | Compliance | Confirm with IT/security before rollout |
| U7 | Transitive dependency license audit | Compliance | Run `license-checker` and `pip-licenses` before v1 release |
