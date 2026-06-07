Implementation Roadmap — Spec Workbench Evolution
Purpose: Enhancements to the Spec Workbench app and command pipeline to support generic, automated artifact generation with human–AI collaboration via tagging. Drop this file in the intake folder and ask the agent to implement it.

## Part 1 — Tag system overhaul
Tag format
[TAG|RECIPIENT] optional message or instruction

[TAG|AI] — instruction for AI to act on (human is tagging for AI to rework)
[TAG|HUMAN] — question or flag for human to address (AI tags back only when it needs more info)

Tag types stay the same: TODO, REVIEW, REWORK, CLARIFY, COMMENT.
Workflow

[TODO|AI] Onderstaande tags zijn voorbeelden, deze mogen niet in het linker menu als for AI of HUMAN komen, misschien tussen soort van quotes zetten om ervoor te zorgen dat ze niet gezien worden als echtes tags?

Human adds a tag, e.g. [CLARIFY|AI] define exact scope of admin permissions.
AI reworks the section and removes the tag when done. No tag-back unless AI needs more info.
If AI cannot complete it, AI tags back, e.g. [CLARIFY|HUMAN] confirm whether read-only access is in scope.
Human reviews, resolves, removes the tag.
Final artifact contains no tags — they are scaffolding, not permanent metadata. No audit trail, no sign-off tag.

Code changes

Update the tag regex in app/app.py (TAG_RE) and frontend/src/render.js (TAG_RE) to capture the recipient:

From: \[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)\]
To: \[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)\|(AI|HUMAN)\]


The get_tags endpoint in app/app.py should return the recipient per tag (type, recipient, text, line).
In the editor toolbar, default inserted tags to |AI (human is normally tagging for AI). Keep a way to insert |HUMAN too.
Color-code or badge tags in the UI by recipient so it's visible at a glance who each tag is for.


## Part 2 — Sidebar split by recipient

Split the existing "To Review" sidebar section into two lists:

For AI — tags with |AI (work waiting on AI)
For You — tags with |HUMAN (work waiting on the human)


Keep the per-file counts.


## Part 3 — App refinements

File/folder picker. Replace the manual path text field in the project modal with a native picker so a project folder can be selected instead of typed.
Remember last project. On page refresh, reload the last active project instead of resetting to empty. Persist the active project (e.g. in projects.json or local state) and restore it on load.


## Part 4 — Artifact restructuring (user stories)

One markdown file per user story instead of a single combined <feature>_stories.md.
Layout:

02_solution/user-stories/<feature>/story-001.md, story-002.md, …


When a feature has more than ~10–20 stories, auto-organize into subdirectories so a single folder never gets overwhelming.
The commands must know this structure — both when generating (write one file per story) and when reading downstream (e.g. acceptance criteria reading stories).
Note: fix folder naming while at it — current repo has user-stores and acceptance-creteria (typos). Standardize to user-stories and acceptance-criteria.


## Part 5 — Generic, automated workflow
The goal: drop an idea into brainstorm or meeting notes, then run the pipeline end-to-end without manual file-by-file instructions.

Commands should be self-contained and chainable: intake → PRD → epics → stories → AC → NFR → risk log → release readiness.
A command should discover its own inputs and outputs from the folder structure rather than needing exact paths each time.
Commands should respect the tag workflow: ideally refuse to advance a stage (or warn) while unresolved |HUMAN tags remain, and strip/ignore tags so generated output stays clean.
The pipeline should handle the new one-file-per-story structure automatically (creating subdirectories past the threshold).


## Open items to confirm later

Exact story-count threshold for subdirectory grouping (10 vs 20).
Whether other artifacts (acceptance criteria, NFRs) should also move to one-file-per-item, mirroring the user-story structure.
Whether commands should hard-block or only warn on unresolved |HUMAN tags.