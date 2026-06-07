# Acceptance Criteria — EP8: Theme Switcher

**Date:** 2026-06-07

---

## S8.1 — Light theme token sets

### AC-8.1-01: Teal Corporate token completeness
**Given** `[data-theme="teal-corporate"]` on `<html>`  
**When** page renders  
**Then** all required tokens defined: `--ac`, `--ac-d`, `--ac-a`, `--nav-bg`, `--sidebar-bg`, `--content-bg`, `--border`, `--txt`, `--txt2`, `--muted`, `--link`, `--link-h`, `--good`, `--warn`, `--font`

### AC-8.1-02: Warm Paper token completeness
**Given** `[data-theme="warm-paper"]` on `<html>`  
**When** page renders  
**Then** same token set fully covered  
**And** Warm Paper uses warm off-white background distinct from Teal Corporate

### AC-8.1-03: Light theme contrast
**Given** either light theme is active  
**When** body text renders on content background  
**Then** contrast ratio ≥ 4.5:1 (WCAG AA)

### AC-8.1-04: Light theme tag readability
**Given** either light theme active  
**When** tag highlights render  
**Then** all 5 tag types meet WCAG AA contrast

---

## S8.2 — Dark theme token sets

### AC-8.2-01: Midnight token completeness
**Given** `[data-theme="midnight"]` on `<html>`  
**When** page renders  
**Then** all tokens defined with dark-appropriate values; `--content-bg` luminance < 0.1

### AC-8.2-02: Bold Agency token completeness
**Given** `[data-theme="bold-agency"]` on `<html>`  
**When** page renders  
**Then** all tokens defined; Bold Agency has distinctive accent distinct from Midnight

### AC-8.2-03: Dark CodeMirror override
**Given** either dark theme is active  
**When** EasyMDE editor is opened  
**Then** CodeMirror surface shows dark background — not white  
**And** editor text is light-coloured and readable

### AC-8.2-04: Dark theme tag readability
**Given** either dark theme is active  
**When** tag highlights render  
**Then** tag colours re-specified for dark backgrounds; all 5 types meet WCAG AA

---

## S8.3–S8.5 — Switcher Control

### AC-8.3-01: Button always visible
**Given** any app state (viewing, editing, modal open)  
**When** topnav renders  
**Then** theme icon button visible in topnav right side (before avatar) with `aria-label`

### AC-8.4-01: All 4 themes in dropdown
**Given** dropdown is open  
**When** rendered  
**Then** exactly 4 options: Teal Corporate, Midnight, Warm Paper, Bold Agency  
**And** each shows theme name + colour swatch strip

### AC-8.4-02: Theme applies on click
**Given** dropdown is open  
**When** user clicks a theme option  
**Then** `data-theme` on `<html>` updates immediately; UI refreshes within 100ms; dropdown closes

### AC-8.4-03: Outside click closes
**Given** dropdown is open  
**When** user clicks anywhere outside  
**Then** dropdown closes; active theme unchanged

### AC-8.4-04: No page reload on switch
**Given** a file is open  
**When** user switches theme  
**Then** file content remains visible — no navigation or reload

### AC-8.5-01: Active theme marked on open
**Given** a theme is active  
**When** dropdown opens  
**Then** active theme has visual indicator (checkmark); only one marked at a time

### AC-8.5-02: Default active on first use
**Given** no stored preference  
**When** dropdown first opened  
**Then** Teal Corporate is marked active

---

## S8.6–S8.7 — Persistence

### AC-8.6-01: localStorage written on switch
**Given** user selects a theme  
**When** confirmed  
**Then** `localStorage.getItem("spec-theme")` returns selected identifier

### AC-8.6-02: localStorage error — session still works
**Given** localStorage unavailable  
**When** user selects a theme  
**Then** theme applies for session; no error shown to user

### AC-8.7-01: Theme applied before body renders
**Given** `"midnight"` stored in localStorage  
**When** page refreshed  
**Then** `<html>` has `data-theme="midnight"` before any visible content; no flash of wrong theme

### AC-8.7-02: No preference → default applied
**Given** no stored preference  
**When** app loads  
**Then** `data-theme="teal-corporate"` applied

### AC-8.7-03: Invalid value → fallback applied
**Given** `localStorage.getItem("spec-theme")` returns unrecognised value  
**When** app loads  
**Then** `data-theme="teal-corporate"` applied silently

---

## S8.8–S8.10 — Surface Coverage

### AC-8.8-01: Topnav fully themed in all 4 themes
**Given** any theme active  
**When** topnav renders  
**Then** background, text, search, avatar, theme button all reflect theme tokens — no hardcoded colours

### AC-8.8-02: Sidebar fully themed in all 4 themes
**Given** any theme active  
**When** sidebar renders  
**Then** background, section headers, file tree rows, filter chips, tag badges all themed

### AC-8.9-01: Content area fully themed
**Given** any theme active  
**When** content area renders  
**Then** page background, breadcrumb, header, tag badge, markdown body all themed

### AC-8.9-02: Editor themed — dark themes
**Given** dark theme active  
**When** editor opened  
**Then** CodeMirror area shows dark background; toolbar icons visible

### AC-8.10-01: Modals themed
**Given** any theme active  
**When** project modal opens  
**Then** modal background, text, inputs, buttons all themed — no white overlay in dark themes

### AC-8.10-02: Tag badges readable in all themes
**Given** any theme active  
**When** file with tags viewed  
**Then** all 5 tag types maintain WCAG AA contrast

---

## S8.11 — No hardcoded colours

### AC-8.11-01: No hex literals in JS files
**Given** source JS files  
**When** grepped for `/#[0-9a-fA-F]{3,6}/`  
**Then** no matches outside Mermaid initialisation block

### AC-8.11-02: Post-cleanup visual regression
**Given** any hardcoded colours replaced with CSS vars  
**When** manual review of all 4 themes done  
**Then** no regression — all surfaces still render correctly
