You are acting as a Solution Architect and Quality Engineer.

Input:
- Auto-discover: most recently modified file matching 02_solution/prds/*_PRD.md

Pre-flight check:
- Strip [TAG|AI] tags silently. Flag [TAG|HUMAN] tags as open items in the relevant NFR file.

Mode decision:
- If this is the BASE product PRD (no feature prefix, e.g. PRD.md): CREATE the NFR files from scratch.
- If this is a FEATURE PRD (feature prefix, e.g. theme-switcher_PRD.md): ADD delta items to existing NFR files — do NOT recreate them.

Task (base product):
1. Generate NFR checklist — ONE FILE PER CATEGORY
2. Output structure (numbered prefix for sort order):
   02_solution/nfrs/01_nfr-performance.md
   02_solution/nfrs/02_nfr-security.md
   02_solution/nfrs/03_nfr-privacy.md
   02_solution/nfrs/04_nfr-reliability.md
   02_solution/nfrs/05_nfr-observability.md
   02_solution/nfrs/06_nfr-accessibility.md
   02_solution/nfrs/07_nfr-compliance.md
   02_solution/nfrs/08_nfr-unknowns.md   (flagged unknowns only)
3. Generate summary index:
   02_solution/nfrs/nfr-index.md
   Columns: Category | Requirement Count | File

Task (feature delta):
1. Append new NFR items to the RELEVANT existing category files only
   - Prefix added items with the feature epic number (e.g. NFR-P8, NFR-A7)
   - Add a comment line: `### EP<N> additions — <feature-name>`
2. Update nfr-index.md requirement counts
3. Do NOT create new files; do NOT overwrite existing content

Each NFR must include:
- Specific, measurable target
- Rationale (1 line)
- Unknown flag if not determinable yet

Rules:
- One file per category — never combine into a single file
- Be specific and measurable where possible
- Flag unknowns explicitly in the unknowns file
- Output is clean markdown — no tags in generated files
