# NFR — Security

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

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
