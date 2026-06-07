# Spec Workbench — Acceptance Criteria: EP7 — Workflow Guide

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

---

## EP7 — Workflow Guide

### S7.1 — Read the built-in pipeline guide

**AC-7.1.1 — Guide accessible from nav**
- **Given** the app is loaded with any active project
- **When** the user clicks "Guide" in the nav
- **Then** the guide opens in the content area showing all 5 pipeline phases

**AC-7.1.2 — All phases documented**
- **Given** the guide is open
- **When** the user reads it
- **Then** each phase (Intake / Discovery / Solution / Delivery / Governance) has: a description of its purpose, the expected artifact types, the folder path, and the relevant Claude Code slash commands

**AC-7.1.3 — Links to existing example artifacts**
- **Given** the active project contains a file at `02_solution/prds/spec-app_PRD.md`
- **When** the guide is open and references PRD examples
- **Then** that file is shown as a clickable in-app link

**AC-7.1.4 — No example artifacts available**
- **Given** the active project has no files in a particular phase folder
- **When** the guide renders that phase
- **Then** the link placeholder is absent or shown as disabled — not a broken link or error

**AC-7.1.5 — Guide is editable**
- **Given** the guide content is stored as a markdown file
- **When** the user clicks "Edit" on the guide page
- **Then** the standard EasyMDE editor opens for the guide file; changes can be saved and are reflected immediately on next open

**AC-7.1.6 — Guide available without active project**
- **Given** no project has been added yet
- **When** the user opens the guide
- **Then** the guide renders fully; artifact links are absent (no project to link into); no error shown
