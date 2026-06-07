# S8.11 — No hardcoded colours bypass theming

**Epic:** EP8 — Theme Switcher  
**Priority:** Should-have

---

**As a** developer maintaining the theme system,  
**I want** all inline colour values in JS-generated HTML removed and replaced with CSS variables,  
**so that** adding a future theme does not require touching JavaScript files.

**Acceptance intent:** Grep for hex literals and `rgb()` in `main.js`, `render.js`, `tree.js`, `editor.js` — none found outside Mermaid initialisation. Any found replaced with `var(--token-name)`. All 4 themes still pass visual review after change.

**Dependencies:** S8.8, S8.9, S8.10.

**Non-goals:** Audit of third-party library CSS (EasyMDE, Mermaid internals).
