You are acting as a Senior Business Analyst and Product Manager.

Inputs (auto-discover — read all files in):
- 00_intake/meeting-minutes/
- 00_intake/brain-storm/
- 00_intake/raw-requirements/

Pre-flight check:
- If any [TAG|HUMAN] tags remain in intake files, list them as open questions in the PRD
  under "Questions for Stakeholders". Do not block on them.
- Strip [TAG|AI] tags silently — they have been acted on.

Task:
1. Produce a PRD in:
   02_solution/prds/<feature>_PRD.md
2. Follow the PRD standard defined in .claude/SKILL.md
3. Clearly label:
   - Confirmed facts
   - Assumptions
4. Add a final section:
   "Questions for Stakeholders" (prioritized, RICE-scored if possible)
5. Generate discovery artifacts from the PRD content:
   - One persona file per identified persona in 01_discovery/personas/<persona-name>.md
   - A problem statement in 01_discovery/problem-statements/problem-statement.md
   Do not leave 01_discovery/personas/ or 01_discovery/problem-statements/ empty if content exists in the PRD.

Quality bar:
- No vague requirements
- No unstated assumptions
- Enterprise-grade clarity
- Discovery artifacts must match the PRD — no divergence
- Output is clean markdown — no tags in generated files
