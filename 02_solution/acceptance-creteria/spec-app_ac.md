# Spec-Driven Development Workbench — Acceptance Criteria

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

---

## EP1 — Foundation & Local Server

### S1.1 — One-command startup

**AC-1.1.1 — Happy path**
- **Given** the repo is cloned and dependencies are installed
- **When** the user runs the start command
- **Then** the server starts on port 3301, the terminal prints `http://localhost:3301`, and the browser-accessible UI loads within 10 seconds

**AC-1.1.2 — Port conflict**
- **Given** port 3301 is already in use by another process
- **When** the user runs the start command
- **Then** the server does not start, the terminal prints a clear error naming port 3301 as the conflict, and the process exits with a non-zero code

**AC-1.1.3 — First run (no config yet)**
- **Given** the app has never been run before and no config file exists
- **When** the user starts the app
- **Then** the app starts without error, the UI shows an empty project list, and prompts the user to add a project

**AC-1.1.4 — Missing Python version**
- **Given** the user's Python version is below 3.10
- **When** the start command is run
- **Then** a clear error is shown stating the minimum Python version required; the server does not start silently

---

### S1.2 — Cross-platform compatibility

**AC-1.2.1 — macOS**
- **Given** the app is running on macOS
- **When** a project path is added and files are browsed
- **Then** POSIX paths resolve correctly and all features work without workaround

**AC-1.2.2 — Windows WSL**
- **Given** the app is running inside WSL on Windows
- **When** a project path pointing to a WSL filesystem location is added
- **Then** files are served correctly and git commands execute without path errors

**AC-1.2.3 — Path with spaces**
- **Given** the project path contains spaces (e.g. `~/My Projects/spec-repo`)
- **When** the path is registered and files are loaded
- **Then** the app resolves the path correctly and no files return 404

**AC-1.2.4 — Negative: native Windows (non-WSL)**
- **Given** the app is run directly in a native Windows CMD/PowerShell environment (not WSL)
- **When** the user starts the app
- **Then** behavior is undefined — the README documents WSL as the supported Windows path; no guarantee of correctness

---

### S1.3 — Offline-capable frontend

**AC-1.3.1 — No external requests at runtime**
- **Given** the Vite build has been run and the app is started
- **When** the browser loads the app with network disabled
- **Then** the app loads fully: file tree, viewer, editor, and Mermaid rendering all work without network access

**AC-1.3.2 — Build not run**
- **Given** the Vite build has not been run (no `dist/` folder)
- **When** the user starts the app
- **Then** the server shows a clear error instructing the user to run `npm run build` first; it does not serve a blank or broken page silently

**AC-1.3.3 — CDN references absent**
- **Given** the production build is inspected
- **When** the network tab is observed during app load
- **Then** zero requests are made to `cdn.jsdelivr.net`, `unpkg.com`, or any other external CDN

---

## EP2 — Multi-Project Management

### S2.1 — Add a project

**AC-2.1.1 — Valid path**
- **Given** the user enters a valid local directory path that exists and contains a git repo
- **When** they confirm the "Add Project" action
- **Then** the project appears in the nav switcher with the folder name as display name, and the file tree loads for that project

**AC-2.1.2 — Invalid path (does not exist)**
- **Given** the user enters a path that does not exist on the filesystem
- **When** they confirm
- **Then** a validation error is shown ("Path not found"), the project is not saved, and the form remains open for correction

**AC-2.1.3 — Path is a file, not a directory**
- **Given** the user enters a path pointing to a file (not a folder)
- **When** they confirm
- **Then** a validation error is shown ("Path must be a directory"), project is not saved

**AC-2.1.4 — Already registered path**
- **Given** a project with the same path is already registered
- **When** the user tries to add it again
- **Then** a warning is shown ("Project already registered") and no duplicate is created

**AC-2.1.5 — Non-git directory**
- **Given** the user enters a valid directory that is not a git repo
- **When** they confirm
- **Then** the project is added and accessible, but git features (Modified indicators, diff) are hidden with a notice: "Git not available for this project"

**AC-2.1.6 — Empty path submitted**
- **Given** the user submits the Add Project form with an empty path
- **When** they confirm
- **Then** form validation blocks submission and shows "Path is required"

---

### S2.2 — Switch between projects

**AC-2.2.1 — Switch project**
- **Given** two or more projects are registered and project A is active
- **When** the user selects project B from the nav switcher
- **Then** the file tree updates to show project B's files within 2 seconds; project A's state is not visible

**AC-2.2.2 — Project path no longer exists**
- **Given** a registered project's directory has been deleted or moved since registration
- **When** the user switches to that project
- **Then** an error banner is shown ("Project directory not found") and an empty tree is displayed; the app does not crash

**AC-2.2.3 — Switch with unsaved changes in editor**
- **Given** the user has unsaved edits in the editor and switches project from the nav
- **When** the switch is triggered
- **Then** a confirmation prompt warns "You have unsaved changes. Switch project and discard?" — switching only proceeds on confirmation

**AC-2.2.4 — Single project registered**
- **Given** only one project is registered
- **When** the user opens the nav switcher
- **Then** the switcher shows the single project as active with an option to "Add Project" — no empty dropdown

---

### S2.3 — Persist session across restarts

**AC-2.3.1 — Project list restored**
- **Given** the user has registered three projects and restarts the app
- **When** the app starts
- **Then** all three projects are present in the nav switcher without re-entering paths

**AC-2.3.2 — Last active project and file restored**
- **Given** the user had project B active with file `02_solution/prds/x_PRD.md` open
- **When** the app restarts
- **Then** project B is active and the same file is loaded in the viewer automatically

**AC-2.3.3 — Corrupted config file**
- **Given** the config JSON file on disk is malformed (e.g., truncated)
- **When** the app starts
- **Then** the app starts successfully with an empty project list and a notice: "Config file could not be read. Starting fresh."

**AC-2.3.4 — Last file no longer exists**
- **Given** the last opened file has been deleted from disk since the last session
- **When** the app restarts and attempts to restore it
- **Then** the app loads the project tree but shows an empty viewer with a notice: "Last file no longer exists"

---

## EP3 — File Navigation & Sidebar

### S3.1 — Browse specs by pipeline phase

**AC-3.1.1 — Standard structure renders**
- **Given** a project with the standard 5-phase folder structure
- **When** the project is loaded
- **Then** sidebar shows five collapsible sections: 00_intake, 01_discovery, 02_solution, 03_delivery, 04_governance — each with correct file icons

**AC-3.1.2 — File opens on click**
- **Given** the file tree is loaded
- **When** the user clicks any file
- **Then** the file opens in the viewer area; the clicked file is highlighted as active in the tree

**AC-3.1.3 — Empty project**
- **Given** the project directory exists but contains no files
- **When** the tree loads
- **Then** an empty state is shown ("No files found") — no crash, no blank sidebar

**AC-3.1.4 — Non-standard folder structure**
- **Given** a project without the standard phase folders
- **When** the tree loads
- **Then** whatever folders and files exist are shown as-is; no error for missing phase folders

**AC-3.1.5 — Deeply nested files**
- **Given** a file exists more than 3 levels deep in the tree
- **When** the tree loads
- **Then** the file is accessible and its full path is shown in the breadcrumb when opened

---

### S3.2 — Filter files by status

**AC-3.2.1 — Modified filter**
- **Given** three files are modified (uncommitted) and ten are not
- **When** the user clicks the "Modified" filter chip
- **Then** only the three modified `.md` files are shown; parent folders of matches expand automatically

**AC-3.2.2 — Has Tags filter**
- **Given** two files contain open `[TODO]` or `[REVIEW]` tags
- **When** the user clicks "Has Tags"
- **Then** only those two files appear in the tree

**AC-3.2.3 — Recent filter**
- **Given** the user has opened five files in the current session
- **When** they click "Recent"
- **Then** those five files are shown, most recent first

**AC-3.2.4 — Filter with no matches**
- **Given** the "Modified" filter is active and no files have uncommitted changes
- **When** the filter is applied
- **Then** tree shows an empty state with message "No modified files" — not a blank sidebar

**AC-3.2.5 — Filter resets on project switch**
- **Given** the "Has Tags" filter is active
- **When** the user switches to a different project
- **Then** the filter resets to "All" and the full tree of the new project is shown

---

### S3.3 — Search files by name

**AC-3.3.1 — Real-time filtering**
- **Given** the user types "persona" in the search box
- **When** each character is typed
- **Then** the tree filters instantly to show only files whose name or path contains "persona"; parent folders expand automatically

**AC-3.3.2 — No matches**
- **Given** the user types a string that matches no file
- **When** the tree updates
- **Then** tree shows "No results for '…'" — not a blank sidebar

**AC-3.3.3 — Clear search**
- **Given** a search term is active
- **When** the user clears the search box
- **Then** the full tree is restored with all files visible

**AC-3.3.4 — Special characters in search**
- **Given** the user types special characters (`#`, `[`, `/`)
- **When** the tree filters
- **Then** no crash; results show files whose names literally contain those characters (if any); otherwise empty state

---

### S3.4 — See files that need review at a glance

**AC-3.4.1 — Files with tags appear**
- **Given** two files contain open tags (`[TODO]`, `[REVIEW]`, etc.)
- **When** the sidebar loads
- **Then** both files appear in the "To Review" section, sorted descending by tag count

**AC-3.4.2 — No open tags**
- **Given** no file in the project contains any open tags
- **When** the sidebar loads
- **Then** the "To Review" section is collapsed or hidden — not showing an empty list

**AC-3.4.3 — Tag resolved updates section**
- **Given** a file is in "To Review" with one `[TODO]` tag
- **When** the user removes the tag and saves
- **Then** the file disappears from "To Review" within 2 seconds of saving

**AC-3.4.4 — Clicking file in To Review**
- **Given** the "To Review" section shows a file
- **When** the user clicks it
- **Then** the file opens in the viewer with all tag badges visible

---

## EP4 — Content Viewing

### S4.1 — Read markdown specs with full formatting

**AC-4.1.1 — Full markdown rendering**
- **Given** a `.md` file with headings, tables, code blocks, bullet lists, and blockquotes
- **When** the file is opened
- **Then** all elements render correctly; raw markdown syntax is not visible

**AC-4.1.2 — Breadcrumb and metadata**
- **Given** a file at `02_solution/prds/spec-app_PRD.md` is opened
- **When** rendered
- **Then** breadcrumb shows `02_solution › prds › spec-app_PRD.md`; section tag shows "PRD"; file path is visible below the title

**AC-4.1.3 — Clickable file path references**
- **Given** the markdown contains a reference like `` `02_solution/prds/spec-app_PRD.md` ``
- **When** rendered
- **Then** the reference is a clickable in-app link that opens the referenced file

**AC-4.1.4 — Malformed markdown**
- **Given** a `.md` file contains malformed markdown (e.g., unclosed code fence)
- **When** opened
- **Then** the file renders as best-effort; no crash; no blank content area

**AC-4.1.5 — Empty file**
- **Given** a `.md` file is empty (0 bytes)
- **When** opened
- **Then** an empty content area is shown; page header still renders with filename

---

### S4.2 — See review tags as colored badges

**AC-4.2.1 — All 5 tag types render**
- **Given** a file contains `[TODO]`, `[REVIEW]`, `[REWORK]`, `[CLARIFY]`, and `[COMMENT]`
- **When** rendered
- **Then** each appears as a distinct colored badge; each has a unique color not shared with other tag types

**AC-4.2.2 — Tag with inline text**
- **Given** `[TODO] Update success metrics` is in the file
- **When** rendered
- **Then** badge shows "TODO" label and "Update success metrics" as badge text

**AC-4.2.3 — Tag with no text**
- **Given** `[REVIEW]` appears alone with nothing after it
- **When** rendered
- **Then** badge shows only the "REVIEW" label — no empty trailing space or missing badge

**AC-4.2.4 — Multiple tags on same line**
- **Given** a line contains two tags: `[TODO] Fix this [REVIEW] and check that`
- **When** rendered
- **Then** both badges render inline in sequence without layout break

**AC-4.2.5 — Tag inside a code block**
- **Given** `[TODO]` appears inside a fenced code block
- **When** rendered
- **Then** it is NOT rendered as a badge — code blocks preserve raw text

---

### S4.3 — View meeting transcripts

**AC-4.3.1 — Speaker-grouped rendering**
- **Given** a well-formed `.vtt` file with two speakers
- **When** opened
- **Then** transcript renders as grouped speaker blocks; consecutive lines from the same speaker are merged; each block shows speaker name and timestamp

**AC-4.3.2 — Summary header**
- **Given** a VTT file with 40 segments and 3 speakers
- **When** rendered
- **Then** a summary header shows "40 segments · 3 speakers: Speaker A, Speaker B, Speaker C"

**AC-4.3.3 — Malformed VTT**
- **Given** the VTT file has invalid syntax (missing `-->`, no content blocks)
- **When** opened
- **Then** an error notice is shown ("Transcript could not be parsed"); no crash; raw text is shown as fallback

**AC-4.3.4 — Single speaker**
- **Given** all cues belong to one speaker
- **When** rendered
- **Then** all content renders under a single speaker block; alternating background logic still applies

**AC-4.3.5 — Empty VTT file**
- **Given** the VTT file is empty or contains only the `WEBVTT` header
- **When** opened
- **Then** empty state is shown: "No transcript content found"

---

### S4.4 — View color swatches and Mermaid diagrams inline

**AC-4.4.1 — Hex color swatch**
- **Given** the text contains `#054e5a`
- **When** rendered
- **Then** a small colored dot matching that hex value appears inline before the hex code

**AC-4.4.2 — rgb/rgba color swatch**
- **Given** the text contains `rgb(5, 78, 90)`
- **When** rendered
- **Then** a matching color swatch dot appears inline

**AC-4.4.3 — Hex inside code block**
- **Given** a hex color appears inside a code block (` ```#054e5a``` `)
- **When** rendered
- **Then** a swatch also appears — color swatches work inside and outside code spans

**AC-4.4.4 — Mermaid diagram renders**
- **Given** a fenced code block with language `mermaid` containing valid diagram syntax
- **When** rendered
- **Then** the diagram is drawn inline; no raw code is visible

**AC-4.4.5 — Malformed Mermaid — no crash**
- **Given** a mermaid code block contains invalid syntax
- **When** rendered
- **Then** raw code is shown with a visible error indicator ("Diagram could not be rendered"); page does not crash or go blank

**AC-4.4.6 — Multiple diagrams on one page**
- **Given** a file contains three mermaid code blocks
- **When** rendered
- **Then** all three render independently; failure of one does not prevent the others from rendering

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

## EP6 — Git Awareness

### S6.1 — See which files have uncommitted changes

**AC-6.1.1 — Orange dot on modified file**
- **Given** a `.md` file has uncommitted changes in git
- **When** the sidebar renders
- **Then** that file shows an orange dot indicator; all parent folder sections are also marked

**AC-6.1.2 — Indicator clears after revert**
- **Given** a file showed an orange dot (had uncommitted changes)
- **When** the changes are reverted externally (e.g., `git checkout`) and the user clicks "Refresh"
- **Then** the orange dot disappears from the file and its parent folders

**AC-6.1.3 — Indicator updates after save**
- **Given** a file had no indicator before editing
- **When** the user edits and saves the file in-app
- **Then** the orange dot appears on that file within 2 seconds of saving

**AC-6.1.4 — Git unavailable**
- **Given** git is not installed or not in PATH
- **When** the sidebar loads
- **Then** no orange dots appear; a notice is shown: "Git not available — change indicators disabled"; no crash

**AC-6.1.5 — New untracked file**
- **Given** a new file has been created but never committed
- **When** the sidebar loads
- **Then** the file shows an orange dot (treated as modified/new)

**AC-6.1.6 — Detached HEAD state**
- **Given** the project repo is in a detached HEAD state
- **When** the sidebar loads
- **Then** git status still runs and returns modified files correctly; no crash

---

### S6.2 — View what changed in a file

**AC-6.2.1 — Changes button appears on modified files only**
- **Given** a file has uncommitted changes
- **When** it is opened in the viewer
- **Then** a "Changes" button is visible in the page actions area

**AC-6.2.2 — Changes button absent on unmodified files**
- **Given** a file has no uncommitted changes
- **When** it is opened
- **Then** no "Changes" button is shown

**AC-6.2.3 — Inline diff renders**
- **Given** the user clicks "Changes" on a modified file
- **When** the diff loads
- **Then** added lines/paragraphs are highlighted green; removed lines/paragraphs are highlighted red; unchanged content renders normally

**AC-6.2.4 — Toggle off restores normal view**
- **Given** the diff view is active
- **When** the user clicks "Changes" again
- **Then** the normal rendered markdown view is restored; no page reload required

**AC-6.2.5 — No previous commit (file is new)**
- **Given** a file has never been committed
- **When** the user opens it and clicks "Changes"
- **Then** a notice is shown: "No previous version to compare — file has not been committed yet"; no crash

**AC-6.2.6 — Changes sidebar section**
- **Given** three `.md` files have uncommitted changes
- **When** the sidebar loads
- **Then** the "Changes" collapsible section lists all three with `+N −N` stats; clicking one opens it with the diff view active

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
