# Theme Switcher — PRD

**Version:** 1.0  
**Date:** 2026-06-07  
**Author:** Jeroen Remans  
**Status:** Draft — ready for epic breakdown

**Feature code:** theme-switcher  
**Parent product:** Spec-Driven Development Workbench

---

## 1. Problem Statement

The Spec Workbench has a single fixed visual theme (teal corporate). Different users work in different contexts and environments — some prefer dark mode for extended reading sessions, others prefer a warmer, more document-like aesthetic, and some need the high-contrast brand-forward look for client-facing use.

There is no way to personalise the visual experience without editing code. This friction reduces adoption and comfort for team members who spend long hours in the tool.

**Confirmed facts:**
- 8 UI mockups exist in `00_intake/ui-concepts/` as validated design references
- 4 themes are confirmed by the product owner: Teal Corporate, Midnight, Warm Paper, Bold Agency
- The current app uses CSS custom properties (`--ac`, `--sidebar-bg`, etc.) on `:root` — already architected for theming
- Frontend is Vite + vanilla JS; backend is Flask (Python 3.13)
- The app runs locally; no server-side session state needed

**Assumptions:**
- One active theme per browser session/user (no per-document themes)
- Theme preference is personal, not project-scoped
- The 4 selected themes are sufficient for v1; additional themes are out of scope

---

## 2. Business Goals & Success Metrics

### Goals
- Increase daily comfort and usage of the Spec Workbench across team members with different preferences
- Support dark-mode users who work long sessions or prefer developer-style tooling
- Provide a client-presentable look (Bold Agency) for demos and screen shares
- Deliver the feature with zero backend changes — purely frontend

### Success Metrics

| Metric | Target |
|--------|--------|
| Theme switching works without page reload | 100% — live apply |
| Theme persists across page refresh | Yes — via localStorage |
| All 4 themes fully cover every UI surface | 100% — nav, sidebar, content, editor, modals, tags |
| Time to switch theme | < 100ms visual transition |
| Works on macOS and Windows/WSL | Yes |

---

## 3. In-Scope / Out-of-Scope

### In-Scope
- 4 themes: Teal Corporate, Midnight, Warm Paper, Bold Agency
- Theme switcher control in the top navigation bar
- Persistence via `localStorage` (key: `spec-theme`)
- Live application — no page reload on switch
- Full coverage: all CSS custom properties replaced per theme
- Editor (EasyMDE) theme adaptation (light vs dark CodeMirror)
- Tag highlight colours adapted per theme (maintain readability in all themes)

### Out-of-Scope
- Per-project theme (theme is user-level, not project-level)
- Custom theme creation or editor
- Server-side theme persistence
- Themes beyond the 4 selected in v1
- Font size customisation
- Mobile / responsive breakpoints (existing scope boundary)

---

## 4. Personas

### Primary: Business Analyst (BA)
- Works in the tool daily for long stretches
- Prefers Warm Paper or Teal Corporate for extended reading and editing
- Wants to switch once and forget — persistent preference is critical

### Secondary: Product Manager (PM)
- Uses Bold Agency for client demos and stakeholder presentations
- Needs to switch quickly before a screen share without disruption to content

### Tertiary: Developer / Tech Lead
- Prefers Midnight — aligns with their existing dark-mode environment (VS Code, Terminal)
- Reads specs in the tool; rarely edits

---

## 5. User Flows

### Flow 1: First-time theme selection
1. User opens the app — default theme is Teal Corporate
2. User clicks the theme icon/button in the topnav
3. A dropdown/panel shows 4 theme options with visual swatches
4. User clicks a theme → app visually updates immediately
5. Preference is saved to `localStorage`

### Flow 2: Returning user
1. User opens the app
2. App reads `localStorage` key `spec-theme`
3. Theme is applied before first paint (no flash of wrong theme)
4. User continues working in their preferred theme

### Flow 3: Demo / screen share
1. PM opens the app (currently in Midnight)
2. PM clicks theme switcher → selects Bold Agency
3. Theme switches in < 100ms
4. PM shares screen — client sees Bold Agency
5. PM switches back to Midnight after call

---

## 6. Functional Requirements

### F1 — Theme Definitions
- F1.1: Four themes are defined as named sets of CSS custom properties: `teal-corporate`, `midnight`, `warm-paper`, `bold-agency`
- F1.2: Each theme overrides all of the following properties: `--ac`, `--ac-d`, `--ac-a`, `--sidebar-bg`, `--content-bg`, `--border`, `--txt`, `--txt2`, `--muted`, `--link`, `--link-h`, `--good`, `--warn`, and any theme-specific additions (e.g. `--nav-bg`, `--font`)
- F1.3: Theme applied via `data-theme` attribute on `<html>` element — CSS selectors: `[data-theme="midnight"] { ... }`
- F1.4: Tag colours (`tag-todo`, `tag-review`, etc.) are re-specified per dark/light theme grouping to maintain readability
- F1.5: EasyMDE CodeMirror skin adapts: light themes use default CodeMirror, dark themes use a dark-adapted override

### F2 — Theme Switcher Control
- F2.1: A theme icon button is visible in the topnav at all times (right side, before avatar)
- F2.2: Clicking opens a compact dropdown showing 4 theme options with name and a colour swatch strip
- F2.3: The active theme is visually indicated (checkmark or highlight)
- F2.4: Clicking a theme option applies it immediately and closes the dropdown
- F2.5: Clicking outside the dropdown closes it without changing the theme

### F3 — Persistence
- F3.1: On theme change, write `localStorage.setItem("spec-theme", themeName)`
- F3.2: On app init, read `localStorage.getItem("spec-theme")` and apply before DOM render
- F3.3: If no stored preference, default to `teal-corporate`
- F3.4: If stored value is invalid/unrecognised, fall back to `teal-corporate`

### F4 — Full Surface Coverage
- F4.1: Topnav background, text, search, avatar fully themed
- F4.2: Sidebar background, section headers, file tree items, filter chips fully themed
- F4.3: Content area background, breadcrumb, page header, markdown body fully themed
- F4.4: Edit bar, tag toolbar, EasyMDE editor surface fully themed
- F4.5: All modals (project modal, directory browser) fully themed
- F4.6: Tag highlights (TODO, REVIEW, REWORK, CLARIFY, COMMENT) remain legible in all themes

---

## 7. Data Requirements

- **Storage:** `localStorage` only — key `spec-theme`, value is one of: `teal-corporate` | `midnight` | `warm-paper` | `bold-agency`
- **No backend changes required:** Theme is entirely client-side
- **No PII:** Theme preference is non-sensitive; no user data involved

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| Performance | Theme switch < 100ms — no layout recalculation flash |
| Reliability | Graceful fallback to `teal-corporate` on any localStorage error |
| Accessibility | All 4 themes meet WCAG AA contrast ratios for text on background |
| Portability | Works on macOS Safari, Chrome, Firefox; Windows Chrome/Edge (WSL) |
| Offline | No external resources loaded per theme — all CSS bundled via Vite |
| Maintainability | Adding a 5th theme requires only: new CSS block + new entry in switcher array |

---

## 9. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| EasyMDE CodeMirror doesn't respect CSS variables in dark theme | Medium | Medium | Test early; use CodeMirror theme override class if needed |
| Tag colours become unreadable in Midnight/Bold Agency | Medium | Low | Define separate tag colour overrides per dark/light group |
| Flash of default theme on load before localStorage is read | Low | Low | Apply theme attribute in `<script>` tag before body renders |
| Sidebar `For AI` / `For You` badge colours clash in Warm Paper | Low | Low | Include badge colours in theme token set |

---

## 10. Rollout Considerations

1. **Phase 1 (this sprint):** Implement all 4 themes + switcher; no feature flag needed — fully additive
2. **Validation:** Test all 4 themes manually against every UI surface before merging
3. **No migration needed:** New feature, no existing data affected
4. **Distribution:** Bundled in next `npm run build` + Flask restart

---

## 11. Questions for Stakeholders

| Priority | Question | Context |
|----------|----------|---------|
| P1 | Should the theme switcher be a dropdown panel or an icon-cycle (clicking cycles through themes)? | Dropdown is more discoverable; cycle is faster for power users |
| P2 | Should colour swatches in the switcher show the actual nav/sidebar colours or a full mini-preview? | Mini-preview is richer but adds complexity |
| P3 | Is WCAG AA sufficient or is AAA required for any theme? | Warm Paper serif body text may fall below AA at small sizes |
