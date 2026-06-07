# S1.3 — Offline-capable frontend

**Epic:** EP1 — Foundation & Local Server  
**Priority:** Must-have

---

**As a** team member without internet access,  
**I want** the app to load fully without external network calls,  
**so that** I can use it in restricted network environments.

**Acceptance intent:** All JS, CSS, and library assets (EasyMDE, marked, Mermaid) are served locally. No CDN requests at runtime.

**Dependencies:** S1.1 complete; Vite build produces self-contained bundle.

**Non-goals:** Caching strategy; service worker; PWA.
