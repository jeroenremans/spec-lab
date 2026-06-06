# Spec-Driven Development Workbench — Epics

**Derived from:** `spec-app_PRD.md` v0.2  
**Date:** 2026-06-06  
**Status:** Draft

---

## Epic Overview

| Epic | Name | Priority | Depends on |
|------|------|----------|-----------|
| EP1 | Foundation & Local Server | Must-have | — |
| EP2 | Multi-Project Management | Must-have | EP1 |
| EP3 | File Navigation & Sidebar | Must-have | EP2 |
| EP4 | Content Viewing | Must-have | EP3 |
| EP5 | Spec Editing | Must-have | EP4 |
| EP6 | Git Awareness | Should-have | EP2 |
| EP7 | Workflow Guide | Nice-to-have | EP3 |

---

## EP1 — Foundation & Local Server

### Objective
Any team member can clone the repo, run one command, and have the app running locally on port 3301 — on macOS and Windows (WSL).

### Scope
- Python Flask server serves the frontend and handles all file and git API requests
- Frontend built with Vite + vanilla JS modules; all dependencies bundled (offline capable)
- Fixed port 3301; clear error if port is in use
- Single startup command: `python app.py` (or equivalent runner script)
- Works on macOS and Windows/WSL without additional configuration

### Out of scope
- Docker, containerisation
- Cloud hosting or remote access
- Authentication

### Dependencies
- Python 3.10+ available on user machine
- Node.js available for Vite build (dev/build time only, not runtime)
- Git available in system PATH

### Risks
- **Windows/WSL path handling** (Medium / Medium): filesystem paths differ between Windows and WSL; needs explicit handling
- **Vite build unfamiliarity** (Low / Low): adds a build step colleagues are not used to; mitigate with documented `npm run build` in README

### Acceptance Boundaries
- Given a freshly cloned repo, when the user runs the start command, then the app opens at `http://localhost:3301` within 10 seconds
- Given git is not installed, when the app starts, then it starts successfully in file-only mode with a visible warning
- Given port 3301 is occupied, when the app starts, then it shows a clear error message in the terminal

---

## EP2 — Multi-Project Management

### Objective
Users can register multiple spec repos and switch between them without restarting the app — one active project at a time.

### Scope
- "Add Project" flow: user provides a local directory path and optional display name
- Project switcher in top nav: shows active project name, dropdown to switch
- Project list persisted across restarts (JSON config file)
- Each project's files are completely isolated — no cross-project access
- App remembers the last opened project and file on restart

### Out of scope
- Simultaneous multi-project view (tabs/panels)
- Remote or network paths
- Project deletion UI (manual config edit acceptable for v1)

### Dependencies
- EP1 (server running)

### Risks
- **Invalid path handling** (High / Medium): user may point to a non-existent or non-git directory; app must validate and show clear error
- **Config file corruption** (Low / High): malformed JSON config breaks startup; needs graceful fallback to empty project list

### Acceptance Boundaries
- Given a valid local path, when the user adds a project, then it appears in the project switcher immediately
- Given the user switches projects, then the file tree updates within 2 seconds without page reload
- Given the app restarts, then the last active project and file are restored automatically
- Given an invalid path is entered, then a clear validation error is shown before saving

---

## EP3 — File Navigation & Sidebar

### Objective
Users can find any spec file instantly via the file tree, filters, and search — with visual cues showing what needs attention.

### Scope
- Sidebar file tree reflecting the standard 5-phase folder structure
- Filter chips: All / Modified / Has Tags / Recent
- Real-time search filtering the tree by filename and path
- "To Review" collapsible section: files with open tags, sorted by tag count
- "Changes" collapsible section: uncommitted `.md` files with +/- stats
- File icons by type (md, vtt, json, html, etc.)

### Out of scope
- Drag-and-drop file reordering
- File creation or deletion via UI
- Folder rename via UI

### Dependencies
- EP2 (active project selected)
- EP6 (git status data, for Modified filter and Changes section)

### Risks
- **Large repos** (Low / Medium): repos with 500+ files may cause slow tree render; mitigate with virtual scroll or lazy load if needed
- **Filter state reset on project switch** (Low / Low): filters should reset to "All" on project switch to avoid confusing empty state

### Acceptance Boundaries
- Given a project with the standard folder structure, when the sidebar loads, then all 5 phases are visible as expandable sections
- Given the user types in the search box, then the tree filters in real-time with no perceptible delay
- Given a file has open tags, then it appears in the "To Review" section with correct count
- Given the "Modified" filter is active, then only uncommitted `.md` files are shown

---

## EP4 — Content Viewing

### Objective
Users can read any spec file in a clean, structured view — with tags, color swatches, diagrams, and non-markdown formats all rendered correctly.

### Scope
- Markdown: full rendering (headings, tables, code blocks, blockquotes, links)
- Inline tag badges: `[TODO]`, `[REVIEW]`, `[REWORK]`, `[CLARIFY]`, `[COMMENT]` rendered as colored labels
- Hex and rgb/rgba color swatches rendered inline
- Mermaid diagrams rendered inline
- File path references in markdown rendered as clickable in-app links
- VTT transcripts: speaker-grouped view with timestamps
- JSON files: syntax-highlighted viewer
- Other files (html, xlsx, pptx, png, jpg): download or open-in-new-tab link
- Page header: file path, section tag (PRD / Discovery / Governance / etc.), breadcrumb

### Out of scope
- PDF rendering
- Video/audio playback (VTT is transcript only)
- Real-time collaborative viewing

### Dependencies
- EP3 (file selection from sidebar)
- EP1 (Vite bundled: marked.js, mermaid bundled offline)

### Risks
- **Mermaid rendering errors** (Medium / Low): malformed diagrams crash the mermaid renderer; needs error boundary to show raw text fallback
- **Large markdown files** (Low / Low): files >500KB may cause slow render; acceptable for v1

### Acceptance Boundaries
- Given a markdown file with all tag types, when viewed, then each tag is rendered as a distinct colored badge
- Given a markdown file with a hex color, when viewed, then a color swatch appears inline
- Given a `.vtt` file, when opened, then speakers are grouped with timestamps visible
- Given a Mermaid code block, when viewed, then the diagram renders inline
- Given a malformed Mermaid block, when viewed, then raw code is shown with an error indicator — no crash

---

## EP5 — Spec Editing

### Objective
BAs can edit any markdown spec file directly in the app and save changes back to disk — with tag insertion tools that speed up the review workflow.

### Scope
- "Edit" button opens EasyMDE markdown editor for `.md` files
- Tag toolbar: one-click insert for all 5 tag types (TODO / REVIEW / REWORK / CLARIFY / COMMENT)
- Floating tag bar appears on text selection in editor
- Slash commands in editor: `/todo`, `/review`, `/rework`, `/clarify`, `/comment`
- Viewer-mode tag insertion: select text in view mode → tag bar appears → tag prepended to line, auto-saved
- Save writes file to disk via backend; git status refreshes after save
- Tag index refreshed on save (auto-clear: tags removed from text = removed from index)
- Unsaved changes prompt before navigating away

### Out of scope
- Collaborative editing
- Version history / undo beyond browser session
- Rich text (non-markdown) editing

### Dependencies
- EP4 (viewer must work before editor)
- EP1 (EasyMDE bundled via Vite)
- EP6 (git status refresh after save)

### Risks
- **Save conflict** (Low / Medium): user edits a file while another process (e.g., Claude Code) also writes it; last write wins — acceptable for v1, no merge needed
- **Tag index drift** (Low / Low): if save fails, tag index may be out of sync; refresh index on every page load as fallback

### Acceptance Boundaries
- Given a `.md` file is open in view mode, when the user clicks "Edit", then EasyMDE opens with the file content
- Given the user clicks a tag button in the toolbar, then `[TAGNAME] ` is inserted at cursor
- Given the user saves, then the file is written to disk and git status updates in sidebar within 2 seconds
- Given the user navigates away with unsaved changes, then a confirmation prompt appears
- Given the user removes a `[TODO]` tag from text and saves, then that file disappears from the "To Review" section

---

## EP6 — Git Awareness

### Objective
Users always know which spec files have changed and what changed — without leaving the app.

### Scope
- Orange dot indicator on files with uncommitted changes in the tree
- Parent folder marked when any child file is modified
- "Changes" button in file viewer shows inline paragraph-level diff (added/removed blocks highlighted)
- "Changes" sidebar section lists all modified `.md` files with +/- line stats
- Git status refreshed automatically after every save and on manual "Refresh" click
- Graceful degradation: if git unavailable, indicators hidden with a warning

### Out of scope
- Commit, push, or pull via the app
- Branch management
- Merge conflict resolution

### Dependencies
- EP1 (git available in PATH)
- EP2 (active project = active git repo)

### Risks
- **Git edge cases** (Medium / Low): detached HEAD, no commits yet, `.git` missing — all must degrade gracefully without crash
- **Performance on large diffs** (Low / Low): very large files may produce slow diff; acceptable for spec files which are small by nature

### Acceptance Boundaries
- Given a file has uncommitted changes, when the sidebar loads, then an orange dot appears on the file and all parent folders
- Given the user clicks "Changes" on a modified file, then additions are highlighted green and deletions red
- Given git is not installed, when the app loads, then it starts without error and git features are hidden with a clear notice
- Given the user saves a file, then git status in the sidebar updates within 2 seconds

---

## EP7 — Workflow Guide

### Objective
New team members understand the 5-phase spec pipeline and know how to use the Claude Code slash commands — without needing external documentation.

### Scope
- Built-in "Guide" section accessible from the nav
- Explains each pipeline phase: Intake → Discovery → Solution → Delivery → Governance
- Each phase shows: purpose, expected artifacts, folder location, relevant slash commands
- Links to example artifacts in the active project (if they exist)
- References available Claude Code commands (`/intake-to-prd`, `/prd-to-epics`, etc.)

### Out of scope
- Interactive guided tour (tooltips, highlights)
- Video walkthroughs
- Localisation (English only)

### Dependencies
- EP3 (file linking from guide to actual artifacts)

### Risks
- **Guide becomes stale** (Medium / Low): if pipeline evolves, guide text needs manual update; mitigate by keeping guide as a markdown file (editable in-app)

### Acceptance Boundaries
- Given a user opens the Guide, then all 5 pipeline phases are described with their folder paths and slash commands
- Given an example artifact exists in the active project, then the guide links to it as a clickable in-app link
- Given the guide content is a markdown file, then it is editable via the standard in-app editor
