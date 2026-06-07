# Spec Workbench — Acceptance Criteria: EP5 — Spec Editing

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

---

## EP5 — Spec Editing

### S5.1 — Edit a spec file in-app

**AC-5.1.1 — Editor opens with file content**
- **Given** a `.md` file is open in view mode
- **When** the user clicks "Edit"
- **Then** EasyMDE opens with the exact current content of the file; view mode is hidden

**AC-5.1.2 — Save writes to disk**
- **Given** the user has made changes in the editor
- **When** they click "Save"
- **Then** the file is written to disk; the viewer refreshes with the new content; git status updates in the sidebar

**AC-5.1.3 — Save failure**
- **Given** the file is read-only or the disk is full
- **When** the user saves
- **Then** an error message is shown ("Save failed: [reason]"); the editor remains open with unsaved content intact; no data is lost

**AC-5.1.4 — Navigate away with unsaved changes**
- **Given** the user has unsaved edits in the editor
- **When** they click another file in the sidebar or switch project
- **Then** a confirmation dialog appears: "You have unsaved changes. Discard and continue?" — navigation proceeds only on confirmation

**AC-5.1.5 — Navigate away without unsaved changes**
- **Given** the user has saved all changes (editor content matches disk)
- **When** they click another file
- **Then** no confirmation dialog; navigation proceeds immediately

**AC-5.1.6 — Edit empty file**
- **Given** a `.md` file is empty
- **When** the user opens it in the editor
- **Then** editor opens with an empty textarea — not a crash or pre-populated content

**AC-5.1.7 — Non-markdown file**
- **Given** a `.vtt` or `.json` file is open in the viewer
- **When** the viewer renders it
- **Then** no "Edit" button is shown — these files are read-only in-app

---

### S5.2 — Insert review tags while editing

**AC-5.2.1 — Toolbar tag insert**
- **Given** the editor is open and the cursor is positioned in the middle of a line
- **When** the user clicks the "TODO" button in the tag toolbar
- **Then** `[TODO] ` is inserted at the current cursor position

**AC-5.2.2 — Floating tag bar on selection**
- **Given** the user selects a word or phrase in the editor
- **When** the selection is made
- **Then** a floating tag bar appears near the selection with all 5 tag buttons

**AC-5.2.3 — Slash command expansion**
- **Given** the user types `/todo` followed by a space in the editor
- **When** the space is typed
- **Then** `/todo ` is replaced with `[TODO] ` inline

**AC-5.2.4 — Slash command at start of line**
- **Given** the cursor is at the start of an empty line and the user types `/review`
- **When** a space or enter follows
- **Then** `[REVIEW] ` replaces the slash command correctly

**AC-5.2.5 — All 5 slash commands work**
- **Given** the editor is open
- **When** the user types `/todo`, `/review`, `/rework`, `/clarify`, or `/comment` followed by space
- **Then** each expands to its respective `[TAGNAME] ` format

**AC-5.2.6 — No cursor (editor just opened)**
- **Given** the editor was just opened and no cursor position is set
- **When** the user clicks a tag toolbar button
- **Then** the tag is inserted at the end of the content without error

---

### S5.3 — Tag content while reading (without entering edit mode)

**AC-5.3.1 — Tag applied in view mode**
- **Given** the user selects text in the viewer (not editor)
- **When** a floating tag bar appears and they click "REVIEW"
- **Then** `[REVIEW] ` is prepended to the line containing the selected text; file auto-saves; view refreshes with the new badge visible

**AC-5.3.2 — No selection — bar does not appear**
- **Given** the user clicks without selecting text in the viewer
- **When** the click event fires
- **Then** no floating tag bar appears

**AC-5.3.3 — Avoid double-tagging**
- **Given** a line already starts with `[TODO]`
- **When** the user selects text on that line and applies another `[TODO]` tag
- **Then** no duplicate tag is added; the existing tag remains unchanged

**AC-5.3.4 — Auto-save failure in view mode tagging**
- **Given** the file becomes read-only between view load and tag apply
- **When** the auto-save is attempted
- **Then** an error banner appears: "Could not save tag — file may be read-only"; the view is not corrupted

**AC-5.3.5 — To Review section updates after view-mode tag**
- **Given** a file had no open tags
- **When** the user adds a `[TODO]` tag via view-mode tagging
- **Then** the file appears in the "To Review" sidebar section within 2 seconds

---
