# S3.6 — Clean filename display in sidebar

**Epic:** EP3 — File Navigation & Sidebar  
**Priority:** Should-have

---

**As a** team member browsing the sidebar,  
**I want** filenames and folder names to display without underscores, dashes, or `.md` extensions,  
**so that** the sidebar reads like natural language rather than raw filenames.

**Acceptance intent:** Underscores and dashes replaced by spaces in display labels. `.md` extension hidden (type implied by file icon). Files named `index.md` are not shown separately — their parent folder name is used as the label. Raw filename preserved in tooltip and file path display.

**Dependencies:** S3.1.

**Non-goals:** Renaming actual files on disk; changing the breadcrumb path (still shows raw name).
