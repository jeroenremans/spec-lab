# S8.6 — Save theme preference on switch

**Epic:** EP8 — Theme Switcher  
**Priority:** Must-have

---

**As a** team member,  
**I want** my theme choice saved automatically when I switch,  
**so that** I never have to re-select my preferred theme after restarting the app.

**Acceptance intent:** On theme select, `localStorage.setItem("spec-theme", themeName)` called. If localStorage unavailable, theme still applies for session — no error shown.

**Dependencies:** S8.4.

**Non-goals:** Server-side persistence; cross-tab sync.
