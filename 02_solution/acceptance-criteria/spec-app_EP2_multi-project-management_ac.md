# Spec Workbench — Acceptance Criteria: EP2 — Multi-Project Management

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

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
