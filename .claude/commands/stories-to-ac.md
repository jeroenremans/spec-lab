You are acting as a Quality-aware Business Analyst.

Input:
- Auto-discover all story files: 02_solution/user-stories/<feature>/**/*.md
  (excludes stories-index.md)

Pre-flight check:
- If any [TAG|HUMAN] tags remain in story files, STOP and list them.
  Do not generate AC until all human-facing tags are resolved.
- Strip [TAG|AI] tags silently from output.

Task:
1. Generate acceptance criteria — one AC file per epic
2. File naming convention (include epic slug):
   02_solution/acceptance-criteria/<EP-ID>_<epic-slug>_ac.md
   Example: EP1_foundation-local-server_ac.md
3. Mirror the epic grouping from story files exactly
4. Use Given / When / Then for each criterion
5. Include per story:
   - Negative cases
   - Boundary conditions
   - Role-based behavior
   - Data state variations
6. Generate summary index:
   02_solution/acceptance-criteria/ac-index.md
   Columns: Epic | Title | AC Count | File

Rules:
- No shallow happy-path-only criteria
- One AC file per epic — include epic title slug in filename
- Output is clean markdown — no tags in generated files
