You are acting as a Product Owner.

Input:
- Auto-discover: most recently modified file matching 02_solution/prds/*_PRD.md

Pre-flight check:
- If any [TAG|HUMAN] tags remain in the PRD, STOP and list them.
  Do not generate epics until all human-facing tags are resolved.
- Strip [TAG|AI] tags silently from output.

Task:
1. Break the PRD into epics
2. Output one file per epic:
   02_solution/prds/<feature>_<EP-ID>_epic.md
   Example: spec-app_EP1_epic.md, spec-app_EP2_epic.md
3. For each epic include:
   - Objective
   - Scope
   - Out-of-scope
   - Dependencies
   - Risks
   - Acceptance boundaries
4. Generate summary index:
   02_solution/prds/<feature>_epics-index.md
   Columns: Epic ID | Title | Priority | Dependencies | Status

Rules:
- No technical implementation details
- Focus on business capability slices
- One file per epic — do not combine
- Output is clean markdown — no tags in generated files
