# ADR-003 — Python Flask as Backend

**Date:** 2026-06-06  
**Status:** Accepted  
**Deciders:** Jeroen Remans

---

## Context

The app needs a local backend server to: serve the frontend, read and write files from the local filesystem, execute git commands, and maintain the project registry. A backend technology must be chosen.

The existing prototype already uses a Python Flask server (`serve-docs.sh` implies a Python-based server). The team uses Python across tooling and scripts.

---

## Decision

Use **Python Flask** as the backend framework. Python 3.10+ is the minimum version. The server binds to `127.0.0.1:3301` only.

---

## Alternatives Considered

**A — FastAPI**
- Modern async Python framework; automatic OpenAPI docs
- Better suited for async I/O and high-concurrency APIs
- Concurrency is irrelevant for a single-user local tool
- Adds `uvicorn` as a required dependency; slightly more complex startup
- No benefit over Flask for this use case

**B — Node.js (Express)**
- Frontend and backend in same language
- Would simplify the developer toolchain (npm only, no Python needed)
- Requires Node.js at runtime (not just build time), contradicting the "Python only to run" goal
- Team is more familiar with Python for scripting and backend work
- Git command execution in Node.js is more verbose than Python's `subprocess`

**C — Flask (chosen)**
- Already used in the existing prototype
- Minimal boilerplate; no async complexity needed
- Python's `subprocess`, `pathlib`, and `os` libraries handle all required filesystem and git operations simply
- Single runtime dependency (`pip install flask`); easy for colleagues to install
- `127.0.0.1` binding is Flask's default — local-only by default

**D — No backend (static file serving)**
- The frontend cannot write files, execute git commands, or maintain a project registry without a backend
- Not viable

---

## Rationale

Flask is the lowest-friction choice given: existing prototype, team familiarity, single-user use case, and simple requirements (file I/O + git subprocess calls). The async and performance advantages of FastAPI are irrelevant for a tool with one concurrent user. The Node.js runtime requirement would add complexity to the user setup without benefit.

---

## Consequences

**Positive:**
- Python is already installed on most developer machines at we+
- `pip install flask` is the only backend dependency for end users
- Simple synchronous request handling is appropriate for the use case
- Existing prototype backend code can be reused and extended

**Negative:**
- Flask's built-in server is not production-grade; acceptable for local-only use
- If the app ever needs async file watching or WebSockets (e.g., live reload when Claude Code writes a file), Flask would need to be replaced or augmented with `flask-socketio`
- No automatic API documentation (unlike FastAPI) — acceptable for internal tooling

---

## Open Follow-Ups

- Evaluate `flask-socketio` for v2 if live file-change detection is needed (watch for Claude Code writing to open files)
- Confirm minimum Python version (3.10) is available on all target colleague machines before first rollout
