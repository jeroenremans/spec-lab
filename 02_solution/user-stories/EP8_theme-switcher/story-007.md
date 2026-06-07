# S8.7 — Restore theme on app load without flash

**Epic:** EP8 — Theme Switcher  
**Priority:** Must-have

---

**As a** team member who returns to the app,  
**I want** my preferred theme applied before the page is visible,  
**so that** I never see a flash of the wrong theme when the app loads.

**Acceptance intent:** `data-theme` set on `<html>` via inline `<script>` in `<head>` before body renders. No visible flash. Invalid/missing value → defaults to `teal-corporate`. localStorage errors are silent.

**Dependencies:** S8.6.

**Non-goals:** Loading spinner; theme animation on first load.
