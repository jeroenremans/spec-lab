# Spec Workbench — Acceptance Criteria: EP3 — File Navigation & Sidebar

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

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
