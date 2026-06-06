# Stakeholder Q&A — Spec App PRD

**Date:** 2026-06-06  
**Participants:** Jeroen Remans  
**Format:** Sequential Q&A based on PRD open questions

---

| # | Question | Decision | Notes |
|---|----------|----------|-------|
| 1 | Project switcher: simultaneous or one-at-a-time? | **One at a time** | Switcher in nav |
| 2 | Backend framework | **Flask** | — |
| 3 | Frontend approach | **Vite + vanilla JS modules** | No framework; split into proper module files; `index.html` too large as single file |
| 4 | Colleague OS support | **macOS + Windows (WSL)** | Both |
| 5 | CDN vs bundled dependencies | **Bundle via Vite** | Offline support; EasyMDE + marked.js included in build |
| 6 | Tag removal behavior | **Automatic** | Tag index recalculated on every save; markdown is single source of truth |
| 7 | Port | **3301 (fixed)** | — |
