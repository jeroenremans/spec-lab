# Spec Workbench — Acceptance Criteria: EP4 — Content Viewing

**Derived from:** `spec-app_stories.md`  
**Date:** 2026-06-06  
**Standard:** Given / When / Then · Negative cases · Boundary conditions · Role-based behavior · Data state variations

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
