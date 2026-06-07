# Spec Workbench — Acceptance Criteria: EP1 — Foundation & Local Server

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

---

## EP1 — Foundation & Local Server

### S1.1 — One-command startup

**AC-1.1.1 — Happy path**
- **Given** the repo is cloned and dependencies are installed
- **When** the user runs the start command
- **Then** the server starts on port 3301, the terminal prints `http://localhost:3301`, and the browser-accessible UI loads within 10 seconds

**AC-1.1.2 — Port conflict**
- **Given** port 3301 is already in use by another process
- **When** the user runs the start command
- **Then** the server does not start, the terminal prints a clear error naming port 3301 as the conflict, and the process exits with a non-zero code

**AC-1.1.3 — First run (no config yet)**
- **Given** the app has never been run before and no config file exists
- **When** the user starts the app
- **Then** the app starts without error, the UI shows an empty project list, and prompts the user to add a project

**AC-1.1.4 — Missing Python version**
- **Given** the user's Python version is below 3.10
- **When** the start command is run
- **Then** a clear error is shown stating the minimum Python version required; the server does not start silently

---

### S1.2 — Cross-platform compatibility

**AC-1.2.1 — macOS**
- **Given** the app is running on macOS
- **When** a project path is added and files are browsed
- **Then** POSIX paths resolve correctly and all features work without workaround

**AC-1.2.2 — Windows WSL**
- **Given** the app is running inside WSL on Windows
- **When** a project path pointing to a WSL filesystem location is added
- **Then** files are served correctly and git commands execute without path errors

**AC-1.2.3 — Path with spaces**
- **Given** the project path contains spaces (e.g. `~/My Projects/spec-repo`)
- **When** the path is registered and files are loaded
- **Then** the app resolves the path correctly and no files return 404

**AC-1.2.4 — Negative: native Windows (non-WSL)**
- **Given** the app is run directly in a native Windows CMD/PowerShell environment (not WSL)
- **When** the user starts the app
- **Then** behavior is undefined — the README documents WSL as the supported Windows path; no guarantee of correctness

---

### S1.3 — Offline-capable frontend

**AC-1.3.1 — No external requests at runtime**
- **Given** the Vite build has been run and the app is started
- **When** the browser loads the app with network disabled
- **Then** the app loads fully: file tree, viewer, editor, and Mermaid rendering all work without network access

**AC-1.3.2 — Build not run**
- **Given** the Vite build has not been run (no `dist/` folder)
- **When** the user starts the app
- **Then** the server shows a clear error instructing the user to run `npm run build` first; it does not serve a blank or broken page silently

**AC-1.3.3 — CDN references absent**
- **Given** the production build is inspected
- **When** the network tab is observed during app load
- **Then** zero requests are made to `cdn.jsdelivr.net`, `unpkg.com`, or any other external CDN

---
