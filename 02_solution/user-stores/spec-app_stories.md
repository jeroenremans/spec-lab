# Spec-Driven Development Workbench — User Stories

**Derived from:** `spec-app_epics.md`  
**Date:** 2026-06-06  
**Status:** Draft — ready for AC

---

## EP1 — Foundation & Local Server

### S1.1 — One-command startup
**As a** team member,  
**I want to** start the spec workbench with a single command,  
**so that** I can access it in my browser at `http://localhost:3301` without any manual configuration.

**Acceptance intent:** App starts cleanly, port 3301 is served, browser shows the workbench UI. Terminal output confirms the URL. If port is occupied, a clear error is shown.

**Dependencies:** Python 3.10+ installed; Node used only at build time (not runtime).

**Non-goals:** Auto-open browser; Docker setup; configurable port.

---

### S1.2 — Cross-platform compatibility
**As a** team member on macOS or Windows (WSL),  
**I want to** run the app without platform-specific workarounds,  
**so that** colleagues on either OS can use it out of the box.

**Acceptance intent:** App starts and serves files correctly on both macOS and Windows/WSL. No manual path separator fixes needed.

**Dependencies:** S1.1 complete.

**Non-goals:** Native Windows (non-WSL) support; Linux server deployment.

---

### S1.3 — Offline-capable frontend
**As a** team member without internet access,  
**I want** the app to load fully without external network calls,  
**so that** I can use it in restricted network environments.

**Acceptance intent:** All JS, CSS, and library assets (EasyMDE, marked, Mermaid) are served locally. No CDN requests at runtime.

**Dependencies:** S1.1 complete; Vite build produces self-contained bundle.

**Non-goals:** Caching strategy; service worker; PWA.

---

## EP2 — Multi-Project Management

### S2.1 — Add a project
**As a** BA,  
**I want to** register a local spec repo by providing its folder path,  
**so that** I can browse and edit its specs in the workbench.

**Acceptance intent:** User enters a valid path → project appears in the switcher with its display name. Invalid or non-existent paths show a validation error without crashing.

**Dependencies:** S1.1.

**Non-goals:** Remote or network paths; project deletion UI; auto-discovery of repos.

---

### S2.2 — Switch between projects
**As a** BA,  
**I want to** switch the active project from the navigation bar,  
**so that** I can move between client repos without restarting the app.

**Acceptance intent:** Clicking a different project in the nav switcher reloads the file tree for that project within 2 seconds. Previous project state is not carried over.

**Dependencies:** S2.1; S3.1.

**Non-goals:** Simultaneous multi-project view; unsaved-changes merge across projects.

---

### S2.3 — Persist session across restarts
**As a** BA,  
**I want** the app to remember my registered projects and last-opened file,  
**so that** I can resume work immediately after restarting.

**Acceptance intent:** After restart, the project list is intact, the last active project is pre-selected, and the last opened file is restored.

**Dependencies:** S2.1.

**Non-goals:** Cloud sync of session state; multi-device session continuity.

---

## EP3 — File Navigation & Sidebar

### S3.1 — Browse specs by pipeline phase
**As a** BA,  
**I want to** see all spec files organized in the 5-phase folder structure in the sidebar,  
**so that** I always know where each artifact lives in the workflow.

**Acceptance intent:** Sidebar renders the tree with collapsible phase sections (00_intake through 04_governance). Files show type icons. Clicking a file opens it in the viewer.

**Dependencies:** S2.2 (active project set).

**Non-goals:** Drag-and-drop reordering; file creation or deletion via UI.

---

### S3.2 — Filter files by status
**As a** BA,  
**I want to** filter the file tree to show only Modified, Has Tags, or Recently viewed files,  
**so that** I can focus on what needs attention without scrolling the full tree.

**Acceptance intent:** Clicking a filter chip shows only matching files and highlights relevant parent folders. Switching back to "All" restores the full tree. Filter resets to "All" on project switch.

**Dependencies:** S3.1; S6.1 (for Modified filter); EP5 (for Has Tags filter).

**Non-goals:** Saving custom filter presets; combining multiple filters simultaneously.

---

### S3.3 — Search files by name
**As a** BA,  
**I want to** type in a search box to filter the file tree in real time,  
**so that** I can find any spec file without knowing its exact folder location.

**Acceptance intent:** Typing filters tree instantly by filename and path. Matching files expand their parent folders. Clearing search restores full tree.

**Dependencies:** S3.1.

**Non-goals:** Full-text search inside file content; fuzzy matching.

---

### S3.4 — See files that need review at a glance
**As a** BA,  
**I want to** see a "To Review" section in the sidebar listing files with open tags,  
**so that** I always know what still needs attention without opening each file.

**Acceptance intent:** "To Review" section shows files containing at least one `[TODO]`, `[REVIEW]`, `[REWORK]`, `[CLARIFY]`, or `[COMMENT]` tag, sorted by tag count. Clicking a file opens it.

**Dependencies:** S3.1; EP5 (tag index built on save).

**Non-goals:** Tag filtering by type in this section; assigning tags to people.

---

## EP4 — Content Viewing

### S4.1 — Read markdown specs with full formatting
**As a** BA,  
**I want to** open any `.md` file and see it rendered cleanly with headings, tables, code blocks, and links,  
**so that** specs are readable without a separate markdown tool.

**Acceptance intent:** All standard markdown elements render correctly. Page shows breadcrumb, section tag (PRD / Discovery / Governance), and file path. File path references in markdown are clickable in-app links.

**Dependencies:** S3.1.

**Non-goals:** Printing or PDF export; markdown linting.

---

### S4.2 — See review tags as colored badges
**As a** BA,  
**I want** `[TODO]`, `[REVIEW]`, `[REWORK]`, `[CLARIFY]`, and `[COMMENT]` markers in spec text to render as distinct colored badges,  
**so that** review status is immediately visible while reading.

**Acceptance intent:** Each tag type renders with its own color. Badge shows tag name and any inline text after it. Tags are visually distinct from body text.

**Dependencies:** S4.1.

**Non-goals:** Filtering view by tag type; clicking a badge to resolve it.

---

### S4.3 — View meeting transcripts
**As a** BA,  
**I want to** open `.vtt` transcript files in a readable speaker-grouped format,  
**so that** I can reference meeting context without leaving the workbench.

**Acceptance intent:** VTT file renders as grouped speaker blocks with timestamps. Consecutive lines from the same speaker are merged. Summary shows total segment count and speakers.

**Dependencies:** S4.1 (viewer infrastructure).

**Non-goals:** Audio/video playback; transcript search; speaker identification.

---

### S4.4 — View color swatches and Mermaid diagrams inline
**As a** BA,  
**I want** hex color values and Mermaid diagram code blocks to render visually inline,  
**so that** design specs are immediately interpretable without external tools.

**Acceptance intent:** Hex colors (`#rrggbb`, `rgb()`) show a color swatch dot next to the value. Mermaid code blocks render as diagrams. Malformed Mermaid shows raw code with a visible error indicator — no crash.

**Dependencies:** S4.1; S1.3 (Mermaid bundled).

**Non-goals:** Color picker or editing; Mermaid diagram editing.

---

## EP5 — Spec Editing

### S5.1 — Edit a spec file in-app
**As a** BA,  
**I want to** click "Edit" on any markdown file and make changes in a WYSIWYG editor,  
**so that** I can update specs without switching to another tool.

**Acceptance intent:** Editor opens with current file content. User can write and format markdown. Clicking "Save" writes the file to disk. Navigating away with unsaved changes triggers a confirmation prompt.

**Dependencies:** S4.1; S1.3 (EasyMDE bundled).

**Non-goals:** Simultaneous editing by multiple users; version history; non-markdown file editing.

---

### S5.2 — Insert review tags while editing
**As a** BA,  
**I want to** insert review tags with one click from a toolbar or by selecting text,  
**so that** marking sections for follow-up is fast and consistent.

**Acceptance intent:** Tag toolbar shows all 5 tag types. Clicking a button inserts `[TAGNAME] ` at cursor. Selecting text shows a floating tag bar. Slash commands (`/todo`, `/review`, etc.) expand inline while typing.

**Dependencies:** S5.1.

**Non-goals:** Custom tag types; tag assignment to team members.

---

### S5.3 — Tag content while reading (without entering edit mode)
**As a** BA,  
**I want to** select text in the viewer and tag it directly,  
**so that** I can flag content for review without opening the full editor.

**Acceptance intent:** Selecting text in view mode shows a floating tag bar. Clicking a tag prepends `[TAGNAME] ` to that line in the raw markdown and auto-saves. The view refreshes immediately showing the new badge. Sidebar "To Review" updates.

**Dependencies:** S5.1; S4.2.

**Non-goals:** Inline annotation threads; multi-line tag spanning.

---

## EP6 — Git Awareness

### S6.1 — See which files have uncommitted changes
**As a** BA,  
**I want** files with uncommitted changes to be visually marked in the sidebar,  
**so that** I always know what has been modified but not yet committed.

**Acceptance intent:** Modified files show an orange dot. All parent folders of modified files are also marked. Indicator updates automatically after every save. If git is unavailable, indicators are hidden with a notice — no crash.

**Dependencies:** S2.2 (active project is a git repo); EP1 (git in PATH).

**Non-goals:** Commit, push, or pull from the app; staging individual files.

---

### S6.2 — View what changed in a file
**As a** BA,  
**I want to** see an inline diff showing what changed in a spec file since the last commit,  
**so that** I can review changes before deciding to commit or continue editing.

**Acceptance intent:** "Changes" button appears on modified files. Clicking toggles an inline diff view: added blocks highlighted green, removed blocks red. Clicking again restores the normal view. A "Changes" sidebar section lists all modified `.md` files with +/- stats.

**Dependencies:** S6.1.

**Non-goals:** Side-by-side diff view; commit authoring; reverting changes.

---

## EP7 — Workflow Guide

### S7.1 — Read the built-in pipeline guide
**As a** new team member,  
**I want to** access a built-in guide explaining the 5-phase spec pipeline and available Claude Code commands,  
**so that** I understand the workflow without needing external documentation.

**Acceptance intent:** Guide section is accessible from the nav. Covers all 5 phases with purpose, folder location, and relevant slash commands. Links to example artifacts in the active project if they exist. Guide content is itself a markdown file editable in-app.

**Dependencies:** S3.1; S4.1.

**Non-goals:** Interactive guided tour; video walkthroughs; localisation.

---

## Story Summary

| Story | Epic | Priority |
|-------|------|----------|
| S1.1 | EP1 | Must-have |
| S1.2 | EP1 | Must-have |
| S1.3 | EP1 | Must-have |
| S2.1 | EP2 | Must-have |
| S2.2 | EP2 | Must-have |
| S2.3 | EP2 | Should-have |
| S3.1 | EP3 | Must-have |
| S3.2 | EP3 | Should-have |
| S3.3 | EP3 | Should-have |
| S3.4 | EP3 | Should-have |
| S4.1 | EP4 | Must-have |
| S4.2 | EP4 | Must-have |
| S4.3 | EP4 | Should-have |
| S4.4 | EP4 | Should-have |
| S5.1 | EP5 | Must-have |
| S5.2 | EP5 | Must-have |
| S5.3 | EP5 | Should-have |
| S6.1 | EP6 | Should-have |
| S6.2 | EP6 | Should-have |
| S7.1 | EP7 | Nice-to-have |
