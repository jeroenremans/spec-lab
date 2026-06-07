You are acting as a Solution Architect and Quality Engineer.

Input:
- Auto-discover: most recently modified file matching 02_solution/prds/*_PRD.md

Pre-flight check:
- Strip [TAG|AI] tags silently. Flag [TAG|HUMAN] tags as open items in the relevant NFR file.

Task:
1. Generate NFR checklist aligned to the feature — ONE FILE PER CATEGORY
2. Output structure:
   02_solution/nfrs/<feature>_nfr-performance.md
   02_solution/nfrs/<feature>_nfr-security.md
   02_solution/nfrs/<feature>_nfr-privacy.md
   02_solution/nfrs/<feature>_nfr-reliability.md
   02_solution/nfrs/<feature>_nfr-observability.md
   02_solution/nfrs/<feature>_nfr-accessibility.md
   02_solution/nfrs/<feature>_nfr-compliance.md
   02_solution/nfrs/<feature>_nfr-unknowns.md   (flagged unknowns only)
3. Generate summary index:
   02_solution/nfrs/<feature>_nfr-index.md
   Columns: Category | Requirement Count | File
4. Each NFR must include:
   - Specific, measurable target
   - Rationale (1 line)
   - Unknown flag if not determinable yet

Rules:
- One file per category — never combine into a single file
- Be specific and measurable where possible
- Flag unknowns explicitly in the unknowns file
- Output is clean markdown — no tags in generated files
