# NFR — Privacy

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

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
