# NFR — Compliance

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

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
