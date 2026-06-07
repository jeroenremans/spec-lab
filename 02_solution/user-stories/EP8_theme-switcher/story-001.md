# S8.1 — Define light theme token sets (Teal Corporate + Warm Paper)

**Epic:** EP8 — Theme Switcher  
**Priority:** Must-have

---

**As a** developer shipping the theme-switcher feature,  
**I want** Teal Corporate and Warm Paper defined as complete CSS custom property sets,  
**so that** every light-mode UI surface renders correctly without falling back to `:root` defaults.

**Acceptance intent:** Both light themes defined under `[data-theme="teal-corporate"]` and `[data-theme="warm-paper"]`. All required tokens present. WCAG AA contrast met. Tag highlights legible.

**Dependencies:** Existing `:root` CSS custom property architecture.

**Non-goals:** JS switching logic; switcher UI; localStorage.
