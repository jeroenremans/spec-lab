# S4.5 — Clickable cross-file links with hover preview

**Epic:** EP4 — Content Viewing  
**Priority:** Should-have

---

**As a** BA reading a spec,  
**I want** file references in markdown (e.g. `[link](path/to/file.md)`) to open the target file in the viewer with one click,  
**so that** I can navigate between related specs without using the sidebar.

**Acceptance intent:** Relative `.md` links in rendered content are clickable in-app (not opened in browser tab). Hovering over a link shows a small preview tooltip with the first 3–5 lines of the target file. If target file does not exist, link shows visual indicator (strikethrough or warning icon). Absolute URLs open in new tab as normal.

**Dependencies:** S4.1; file content API available.

**Non-goals:** Editing links in view mode; circular reference detection; non-MD file preview.
