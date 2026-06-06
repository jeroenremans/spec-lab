# Persona — Developer / Tech Lead

**Name:** Lena (composite)  
**Role:** Senior Developer or Tech Lead on a delivery team  
**Experience:** Strong technical background; reads specs to understand what to build

---

## Goals
- Read finalized specs without needing a separate tool or login
- Understand what changed in a spec since last review
- Know which stories have AC and which don't (to flag gaps before sprint start)
- Access decision records to understand architectural choices without asking the BA/PM

## Daily frustrations
- Specs arrive as Word documents or Confluence pages that are out of date by the time dev starts
- No way to see what changed in a spec between sprint planning and now
- AC is either missing, or written at too high a level to be testable
- Tech decisions are made without documentation — rationale is lost

## How they use the workbench
- Read-only consumer: opens files in the viewer, never edits
- Uses the diff view to see what changed in a spec since last commit
- Checks `04_governance/decision-records/` for ADRs before implementing a component
- Checks `02_solution/acceptance-creteria/` to confirm AC exists for stories they are implementing

## Comfort with tech
- Fully comfortable cloning repos, running `python app.py`
- Does not use Claude Code commands; not responsible for spec authoring
- Would appreciate being able to bookmark a specific spec file URL

## Success for this persona
"Before starting the sprint, I checked the diff view on the PRD and saw exactly what had changed since the last review — no need to ask the BA."
