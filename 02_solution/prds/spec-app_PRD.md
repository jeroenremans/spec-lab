# Spec-Driven Development Workbench — PRD

**Version:** 0.2 — Decisions incorporated  
**Date:** 2026-06-06  
**Author:** Jeroen Remans  
**Status:** Ready for epics

**Key decisions (2026-06-06):** One project at a time · Flask backend · Vite + vanilla JS (no framework) · macOS + Windows/WSL · Bundle deps offline · Tags auto-cleared on save · Port 3301 fixed

---

## 1. Problem Statement

BA and PM teams produce specifications in isolation — one-off PRDs, scattered meeting notes, unlinked user stories. Outputs are fragile: quality depends on who wrote them and what context they remembered to include. There is no shared standard, no traceability between artifacts, and no consistent pipeline from raw intake to delivery-ready specs.

A working prototype already exists (PIM Dashboard docs app) but is tightly coupled to a single project. It needs to become a reusable, multi-project workbench that any team member can run locally against any repo.

**Confirmed facts:**
- A working single-project version exists (`00_intake/initial-code/docs-preview/index.html`) with: file tree, WYSIWYG markdown editor (EasyMDE), git status indicators, diff view, inline tag system (TODO / REVIEW / REWORK / CLARIFY / COMMENT), VTT transcript player, JSON viewer, color swatch rendering.
- Backend endpoints already defined: `/_git/status`, `/_git/diff`, `/_git/diff-stat`, `/_git/head-content`, `/_tags`, `files.json`.
- Target folder structure is defined and adopted: `00_intake → 01_discovery → 02_solution → 03_delivery → 04_governance`.
- Claude Code slash commands are in place for the full BA/PM pipeline.

**Assumptions:**
- Users run the app locally (not SaaS); no cloud hosting required initially.
- Each project is a git repository with the standard folder structure.
- Primary users are BAs and PMs at we+, not developers.
- Team shares the spec repo via git; Claude Code commands are the primary workflow driver.

---

## 2. Business Goals & Success Metrics

### Goals
- Reduce time from raw intake to reviewed PRD draft from days to hours.
- Standardize spec quality across we+ BA/PM teams (consistent structure, no unstated assumptions).
- Enable any team member to spin up the workbench against any project in under 5 minutes.
- Create traceability: intake → PRD → epics → stories → AC → NFRs — all in one place.

### Success Metrics

| Metric | Target |
|--------|--------|
| Time to PRD v1 from raw intake | ≤ 90 minutes |
| Projects onboarded in first month | ≥ 3 |
| Spec review cycles reduced | ≥ 30% fewer back-and-forths |
| Setup time for new team member | ≤ 5 minutes (clone + run) |

---

## 3. In-Scope / Out-of-Scope

### In-Scope
- Multi-project support: add/switch projects by pointing to local directories
- Markdown viewer with tag rendering (TODO / REVIEW / REWORK / CLARIFY / COMMENT)
- WYSIWYG markdown editor (inline editing, save back to file)
- Git integration: uncommitted file indicators, diff view, file status badges
- Sidebar: file tree, filter (All / Modified / Has Tags / Recent), "To Review" section
- Format support: Markdown, VTT transcripts, JSON (viewer), hex color swatches, Mermaid diagrams
- Python backend serving the app locally (filesystem access, git commands)
- Built-in workflow guide explaining the intake-to-delivery pipeline
- Claude Code slash commands integrated into the workbench repo

### Out-of-Scope (this version)
- Cloud / SaaS hosting
- Multi-user real-time collaboration
- Authentication / access control
- MCP tool integrations (Jira, Confluence, Notion) — planned phase 2
- Mobile support
- Angular frontend rewrite (existing vanilla JS/HTML is sufficient for v1)

---

## 4. Personas

### Primary: Business Analyst (BA)
- Runs the app daily to draft, review, and refine specs
- Needs: fast editor, tag-based review workflow, traceability between artifacts
- Pain today: specs live in email threads and unlinked docs

### Secondary: Product Manager (PM)
- Uses the workbench to review PRDs, approve stories, track decisions
- Needs: clear pipeline status, governance artifacts (risk log, decision records)
- Pain today: no single view of spec maturity across a project

### Tertiary: Developer / Tech Lead
- Reads finalized specs in `02_solution/` and `03_delivery/`
- Needs: clean markdown rendering, diff view to see what changed
- Does not edit; read-only consumer

---

## 5. User Flows

### Flow 1: New project onboarding
1. User clones spec-app repo
2. Runs `python app.py` (or equivalent)
3. Opens `http://localhost:<port>` in browser
4. Clicks "Add Project" → selects local directory path
5. App reads folder structure, renders file tree in sidebar
6. User opens `00_intake/brain-storm/` to start

### Flow 2: Daily spec work (BA)
1. Opens app, selects active project
2. Sidebar shows "Modified" and "To Review" files at a glance
3. Opens a spec file → reads rendered markdown
4. Clicks "Edit" → WYSIWYG editor opens
5. Marks sections with tags (TODO / REVIEW / CLARIFY)
6. Saves → file written to disk, git status updates
7. Runs `/intake-to-prd` in Claude Code to generate PRD draft

### Flow 3: Pipeline progression
1. BA runs `/intake-to-prd` → PRD created in `02_solution/prds/`
2. PM reviews PRD in app, adds [REVIEW] / [CLARIFY] tags
3. BA addresses tags, iterates
4. PM approves → BA runs `/prd-to-epics` → `/epics-to-stories` → `/stories-to-ac`
5. Before sprint: `/nfr-pack` + `/risk-log-update`
6. Before release: `/decision-record` + `/release-readiness`

---

## 6. Functional Requirements

### F1 — Multi-Project Management
- F1.1: User can add a project by specifying a local filesystem path
- F1.2: User can switch between registered projects without restarting the app
- F1.3: Each project's file tree is isolated; no cross-project file access
- F1.4: App persists project list across restarts (config file or SQLite)

### F2 — File Tree & Navigation
- F2.1: Sidebar renders the folder structure following the standard 5-phase layout
- F2.2: Files display git status indicator (modified = orange dot)
- F2.3: Filter chips: All / Modified / Has Tags / Recent
- F2.4: "To Review" section lists files with open tags, sorted by tag count
- F2.5: Search filters the tree in real-time

### F3 — Markdown Viewer
- F3.1: Renders markdown with headings, tables, code blocks, blockquotes
- F3.2: Inline tag rendering: `[TODO]`, `[REVIEW]`, `[REWORK]`, `[CLARIFY]`, `[COMMENT]`
- F3.3: Hex color swatches rendered inline (e.g., `#054e5a` → colored dot + text)
- F3.4: Mermaid diagrams rendered inline
- F3.5: File path references in markdown rendered as clickable links

### F4 — WYSIWYG Editor
- F4.1: EasyMDE-based markdown editor opens on "Edit" click
- F4.2: Tag toolbar: one-click insert for all 5 tag types
- F4.3: Floating tag bar appears on text selection
- F4.4: Slash commands in editor: `/todo`, `/review`, `/rework`, `/clarify`, `/comment`
- F4.5: Save writes directly to the filesystem via backend PUT endpoint
- F4.6: Unsaved changes prompt on navigation away

### F5 — Git Integration
- F5.1: Backend calls `git status` to detect uncommitted files
- F5.2: Backend calls `git diff` to produce line-level diff for any file
- F5.3: "Changes" button in viewer shows inline diff (paragraph-level LCS)
- F5.4: "Changes" sidebar section lists all modified `.md` files with +/- stats

### F6 — Format Support
- F6.1: `.md` files → rendered markdown viewer + editor
- F6.2: `.vtt` files → meeting transcript player (speaker grouping, timestamps)
- F6.3: `.json` files → syntax-highlighted JSON viewer
- F6.4: `.html`, `.xlsx`, `.pptx`, `.png`, `.jpg` → download/open-in-new-tab link
- F6.5: Format registry is extensible (config-driven, not hardcoded)

### F7 — Workflow Guide
- F7.1: Built-in "Guide" section explains the 5-phase pipeline
- F7.2: Each phase links to example artifacts
- F7.3: Guide references the available Claude Code slash commands

---

## 7. Data Requirements

- **Storage:** Local filesystem only; no database required for file content
- **Project registry:** Persisted in a local config file (JSON or SQLite) — path, display name, last opened
- **Git data:** Read-only access via `git` CLI; no git credentials stored in app
- **Tag index:** Built at startup by scanning `.md` files for `[TAG]` patterns; refreshed on save
- **No PII:** No user data collected, stored, or transmitted

**Assumption:** Git is installed and available in the system PATH on the user's machine.

---

## 8. Non-Functional Requirements

_(High-level; full detail in `/nfr-pack` output)_

| Category | Requirement |
|----------|------------|
| Performance | File tree loads < 1s for repos up to 500 files; markdown renders < 200ms |
| Security | No remote execution; local only; no eval of untrusted content |
| Privacy | No telemetry, no cloud calls, no external font/CDN dependencies in production |
| Reliability | App recovers gracefully if git is unavailable (degrades to file-only mode) |
| Accessibility | Keyboard-navigable sidebar and editor; sufficient color contrast (WCAG AA) |
| Portability | Runs on macOS and Windows; Python 3.10+; no Docker required for basic setup |

---

## 9. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Existing HTML prototype too tightly coupled to single project | High | High | Refactor backend to accept project path as param; abstract file serving |
| Team adoption — colleagues prefer other tools | Medium | Medium | Build guided setup in < 5 min; document clearly in README |
| Git edge cases (detached HEAD, no commits) | Medium | Low | Graceful degradation; show warning instead of crash |
| Mermaid rendering dependency (CDN) | Low | Low | Bundle mermaid locally for offline use |
| Scope creep toward SaaS / multi-user | Medium | High | Explicitly out of scope in v1; document decision record |

---

## 10. Rollout Considerations

1. **Phase 1 (this sprint):** Refactor existing PIM Dashboard prototype to support multi-project switching; extract backend into standalone Python server
2. **Phase 2:** Onboard 2–3 we+ projects; gather feedback; fix friction points
3. **Phase 3:** MCP integrations (Jira/Confluence) when quality bar is stable
4. **No deployment required:** Local-only; distribution via git clone

**Assumption:** Rollout starts with Jeroen + 1–2 colleagues as pilot users before broader we+ adoption.

---

## 11. Decisions Log

_All questions resolved 2026-06-06. See `00_intake/meeting-minutes/stakeholder-qa_01.md` for full Q&A._

| # | Question | Decision |
|---|----------|----------|
| 1 | Project switcher | One project at a time; switcher in nav |
| 2 | Backend | Flask |
| 3 | Frontend | Vite + vanilla JS modules (no framework) |
| 4 | OS support | macOS + Windows (WSL) |
| 5 | Dependencies | Bundle via Vite (offline capable) |
| 6 | Tag removal | Automatic on save; markdown is source of truth |
| 7 | Port | 3301 (fixed) |
