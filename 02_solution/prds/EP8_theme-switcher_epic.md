# EP8 — Theme Switcher

**Product:** Spec-Driven Development Workbench  
**Date:** 2026-06-07  
**Status:** Draft  
**Reference PRD:** [theme-switcher_PRD.md](theme-switcher_PRD.md)

---

## Objective

Allow users to switch between 4 visual themes (Teal Corporate, Midnight, Warm Paper, Bold Agency) via a persistent, live-updating theme control in the topnav.

---

## Scope

- **EP8.1 — Theme Definitions:** 4 named CSS custom property sets, including dark-adapted EasyMDE CodeMirror overrides and dark-theme tag colour variants
- **EP8.2 — Switcher Control:** Theme icon button in topnav, dropdown with colour swatches, active theme indicator, live apply (< 100ms), no page reload
- **EP8.3 — Persistence:** localStorage read/write (`spec-theme` key), applied via inline `<script>` in `<head>` before first paint, fallback to `teal-corporate`
- **EP8.4 — Full Surface Coverage:** All UI surfaces themed (nav, sidebar, content, editor, modals, tags, badges) — no hardcoded colours bypass theming

## Out of Scope

- Per-project themes; custom theme creation; font size personalisation; backend changes; themes beyond the 4 selected

---

## Dependencies

- Existing CSS custom property architecture on `:root` (already in place)
- Reference mockups: `00_intake/ui-concepts/` (ui-01 through ui-08)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| EasyMDE CodeMirror ignores CSS vars in dark theme | Medium | Medium | Use CodeMirror override class; test early |
| Tag colours unreadable in dark themes | Medium | Low | Re-specify tag colours per dark/light group |
| Flash of default theme on load | Low | Low | Apply theme in `<script>` before body renders |

---

## Acceptance Boundaries

- All 4 themes switch in < 100ms
- Theme persists across page refresh — no flash of wrong theme
- All UI surfaces fully themed in all 4 themes
- WCAG AA contrast met for body text and tag badges in all themes
