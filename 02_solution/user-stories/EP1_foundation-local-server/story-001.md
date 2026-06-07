# S1.1 — One-command startup

**Epic:** EP1 — Foundation & Local Server  
**Priority:** Must-have

---

**As a** team member,  
**I want to** start the spec workbench with a single command,  
**so that** I can access it in my browser at `http://localhost:3301` without any manual configuration.

**Acceptance intent:** App starts cleanly, port 3301 is served, browser shows the workbench UI. Terminal output confirms the URL. If port is occupied, a clear error is shown.

**Dependencies:** Python 3.10+ installed; Node used only at build time (not runtime).

**Non-goals:** Auto-open browser; Docker setup; configurable port.
