# NFR — Accessibility

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

---

## 6. Accessibility

### NFR-A1 — WCAG 2.1 AA compliance target
- **Requirement:** The app targets **WCAG 2.1 Level AA** compliance for all interactive UI elements.
- **Unknown:** Full WCAG audit is not planned for v1 given the internal tool context. However, the following specific criteria are non-negotiable:

### NFR-A2 — Color contrast
- **Requirement:** All text and interactive elements must meet WCAG AA contrast ratios:
  - Normal text: minimum **4.5:1**
  - Large text (18pt+ or 14pt bold): minimum **3:1**
- **Measurable:** Verified via browser accessibility inspector or axe-core scan on main views.

### NFR-A3 — Keyboard navigation
- **Requirement:** The sidebar file tree, filter chips, nav switcher, and editor toolbar must be fully navigable by keyboard (Tab, Enter, Arrow keys). No mouse-only interactions for core workflows.
- **Measurable:** Complete the core BA workflow (open project → browse → open file → edit → save) without touching the mouse.

### NFR-A4 — Focus indicators
- **Requirement:** All interactive elements must have a visible focus ring when navigated via keyboard. No `outline: none` without a custom focus style.
- **Measurable:** Tab through all interactive elements; focus ring visible at each stop.

### NFR-A5 — Screen reader basics
- **Requirement:** Page landmarks (`<nav>`, `<main>`, `<aside>`), headings hierarchy, and button labels must be correct so screen readers can announce the UI structure meaningfully.
- **Unknown:** Full screen reader testing (VoiceOver, NVDA) is not planned for v1. Flag for v2 if accessibility is a requirement for specific colleagues.

### NFR-A6 — Tag color badges — not color-only
- **Requirement:** Review tag badges (TODO / REVIEW / REWORK / CLARIFY / COMMENT) must convey type not only by color but also by label text. Users who are color-blind must be able to distinguish tag types.
- **Measurable:** Tag type is always shown as text; verified with color-blindness simulation filter.

### NFR-A7 — Theme contrast — all 4 themes (EP8)
- **Requirement:** Body text on background meets **WCAG AA (4.5:1)** in all 4 themes. Tag badge text on badge background meets WCAG AA in all 4 themes.
- **Rationale:** Theme switcher changes colour context; each theme must independently pass contrast requirements.

### NFR-A8 — Theme button accessible label (EP8)
- **Requirement:** Theme switcher button has `aria-label` or `title` attribute describing its purpose.
- **Measurable:** Inspect button element; confirm accessible name is present.

### NFR-A9 — Focus ring in all themes (EP8)
- **Requirement:** Theme button and dropdown options show a visible focus ring in all 4 themes.
- **Rationale:** Keyboard users must see focus indicator regardless of which theme is active.

---
