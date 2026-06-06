You are acting as a Delivery-focused Product Manager.

Input:
- 02_solution/prds/<feature>_epics.md

Task:
1. Generate sprint-ready user stories
2. Output one file per epic:
   02_solution/user-stores/<feature>_<EP-ID>_stories.md
   Example: spec-app_EP1_stories.md, spec-app_EP2_stories.md
3. Each story must include:
   - User story format
   - Acceptance intent
   - Dependencies
   - Non-goals
4. Include a summary index file:
   02_solution/user-stores/<feature>_stories-index.md
   listing all stories across epics with priority and epic reference

Rules:
- Vertical slices only
- Avoid technical task breakdowns
- One file per epic — do not combine epics into a single file
