# Spec-Driven Development Workbench — Release Readiness Checklist

**Feature:** spec-app v1.0  
**Date:** 2026-06-06  
**Release Manager:** Jeroen Remans  
**Status:** Pre-build — checklist to be completed before v1 pilot release

**How to use:** Work through each section before releasing to pilot colleagues. Mark each item `[x]` when verified. Do not release with any `[ ]` item in the "Blocking" sections.

---

## 1. Functional Readiness

### 1.1 Must-have stories — all must pass before release

| Story | Description | AC passing | Blocking |
|-------|-------------|-----------|---------|
| S1.1 | One-command startup on port 3301 | [ ] | Yes |
| S1.2 | Works on macOS and Windows/WSL | [ ] | Yes |
| S1.3 | Frontend loads fully offline (no CDN) | [ ] | Yes |
| S2.1 | Add a project by local path | [ ] | Yes |
| S2.2 | Switch between projects without restart | [ ] | Yes |
| S3.1 | Browse file tree by pipeline phase | [ ] | Yes |
| S4.1 | Read markdown with full formatting | [ ] | Yes |
| S4.2 | Review tags render as colored badges | [ ] | Yes |
| S5.1 | Edit markdown in-app and save to disk | [ ] | Yes |
| S5.2 | Insert review tags via toolbar / slash commands | [ ] | Yes |

### 1.2 Should-have stories — release with known gaps documented

| Story | Description | AC passing | Blocking |
|-------|-------------|-----------|---------|
| S2.3 | Session persists across restarts | [ ] | No |
| S3.2 | Filter by Modified / Has Tags / Recent | [ ] | No |
| S3.3 | Real-time file search | [ ] | No |
| S3.4 | To Review section in sidebar | [ ] | No |
| S4.3 | VTT transcript viewer | [ ] | No |
| S4.4 | Color swatches and Mermaid diagrams | [ ] | No |
| S5.3 | Tag content while reading (view-mode tagging) | [ ] | No |
| S6.1 | Git change indicators in sidebar | [ ] | No |
| S6.2 | Inline diff view | [ ] | No |

### 1.3 Nice-to-have stories — deferred to v1.1

| Story | Description | Deferred |
|-------|-------------|---------|
| S7.1 | Built-in workflow guide | Yes — post-pilot |

### 1.4 Regression check
- [ ] Opening a file that was working before the refactor still works correctly (PIM Dashboard prototype parity check)
- [ ] No `console.error` or unhandled promise rejections in browser devtools during full happy-path walkthrough

---

## 2. Data Readiness

| Check | Verified | Blocking |
|-------|---------|---------|
| Config file is written atomically (tmp → rename) | [ ] | Yes |
| Config corruption recovery creates `.bak` and starts fresh | [ ] | Yes |
| EasyMDE autosave is explicitly disabled (`autosave: {enabled: false}`) | [ ] | Yes |
| No spec file content written to browser `localStorage` or `sessionStorage` | [ ] | Yes |
| Project registry stores only: path, display name, last opened — no PII | [ ] | Yes |
| Tag index rebuilt on every save (stale tags do not persist after removal) | [ ] | Yes |
| Save operation uses atomic write (or equivalent) to prevent partial file writes | [ ] | No |

---

## 3. Security / Compliance Readiness

| Check | Verified | Blocking |
|-------|---------|---------|
| Flask server binds to `127.0.0.1` only — not `0.0.0.0` | [ ] | Yes |
| No `subprocess` call uses `shell=True` with user-controlled input | [ ] | Yes |
| File read/write endpoints validate path is inside active project directory | [ ] | Yes |
| Attempt to access `../../etc/passwd` returns HTTP 403 (path traversal test) | [ ] | Yes |
| PUT endpoint rejects writes to non-`.md` file types | [ ] | Yes |
| `npm audit --audit-level=high` returns zero findings | [ ] | Yes |
| `pip audit` returns zero critical/high CVEs | [ ] | Yes |
| `npx license-checker --failOn GPL` passes (no GPL dependencies) | [ ] | Yes |
| `pip-licenses --fail-on GPL` passes | [ ] | Yes |
| Mermaid CSP compatibility investigated and documented (see R04) | [ ] | Yes |
| No external HTTP requests at runtime (verify via browser Network tab) | [ ] | Yes |
| we+ IT / security informal approval confirmed (or explicitly waived for pilot) | [ ] | No |

---

## 4. Support and Ops Readiness

### 4.1 Documentation

| Item | Done | Blocking |
|------|------|---------|
| README: end-user setup (clone, `pip install`, `python app.py`) | [ ] | Yes |
| README: developer setup (Node.js, `npm install`, `npm run build`, `npm run dev`) | [ ] | Yes |
| README: Windows/WSL path format documented | [ ] | Yes |
| README: "Out of scope v1" section referencing ADR-001 | [ ] | No |
| README: known limitations listed | [ ] | No |
| COMMANDS.md accurate and up to date | [x] | No |

### 4.2 Operational checks

| Item | Done | Blocking |
|------|------|---------|
| `dist/` (Vite build output) committed to repo so Node.js not required to run | [ ] | Yes |
| Single `python app.py` starts the full app (no manual Vite step for end users) | [ ] | Yes |
| Clear error printed if port 3301 is occupied (not a silent hang) | [ ] | Yes |
| Clear error printed if Python < 3.10 (not a silent import error) | [ ] | Yes |
| App starts correctly with no registered projects (first-run state) | [ ] | Yes |
| App starts correctly with a corrupt config file (creates `.bak`, starts fresh) | [ ] | Yes |
| App starts correctly when git is absent (file-only mode with notice) | [ ] | Yes |
| Startup log prints: version, port, config path, project count | [ ] | No |

### 4.3 Pilot onboarding

| Item | Done | Blocking |
|------|------|---------|
| At least 1 colleague has completed the setup end-to-end on their machine | [ ] | Yes |
| Pilot colleague has added at least 1 project and opened a spec file | [ ] | Yes |
| Feedback channel defined (chat, issue tracker, or shared doc) | [ ] | No |

---

## 5. Known Limitations (v1)

The following limitations are accepted for v1 and documented for pilot users.

### Functional limitations
- **Single user only:** No multi-user or real-time collaboration. Each user runs their own instance.
- **One project at a time:** Cannot view two projects simultaneously (ADR-004).
- **No commit / push from app:** Git is read-only in the app. Committing and pushing remain external CLI/IDE workflows.
- **No file creation or deletion:** Files can only be edited, not created or deleted via the UI.
- **Workflow guide not included in v1:** S7.1 is deferred to v1.1.
- **No full-text search:** Search filters by filename/path only, not file content.

### Technical limitations
- **Flask dev server:** The app runs Flask's built-in server (not production-grade). Acceptable for local use; not suitable for any shared/hosted deployment.
- **No hot reload for end users:** Frontend changes require a Vite rebuild. Committed `dist/` ensures this is a developer concern only.
- **Save conflict not detected:** If Claude Code writes to a file that is open in the editor, the last write wins with no warning (R07). Users must avoid concurrent edits.
- **Files > 200KB:** Render performance for large markdown files is untested. No size warning in v1.
- **Mermaid CSP status:** Depending on investigation of R04, Mermaid rendering may be disabled in v1 if `unsafe-eval` cannot be safely scoped.

### Platform limitations
- **Windows native (non-WSL) not supported:** Only macOS and Windows via WSL are supported in v1.
- **Python 3.10+ required:** Older Python versions are not supported and produce a clear error on startup.

---

## 6. Go / No-Go Decision

**Release criteria:** All blocking items in sections 1.1, 2, 3, and 4.2 must be `[x]` before releasing to pilot colleagues.

| Section | Status | Gate |
|---------|--------|------|
| 1.1 Must-have stories | Not started | Blocking |
| 2. Data readiness | Not started | Blocking |
| 3. Security / compliance | Not started | Blocking |
| 4.2 Ops checks | Not started | Blocking |
| 4.3 Pilot onboarding | Not started | Blocking (1 colleague) |

**Current status:** Pre-build. Checklist to be revisited once implementation is complete.
