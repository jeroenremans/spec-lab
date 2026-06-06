# Slash Commands

This project uses Claude Code slash commands to run a repeatable spec-driven workflow.
Commands are stored in `.claude/commands/` and available to everyone who clones this repo.

---

## Pipeline Overview

```
/intake-to-prd → /prd-to-epics → /epics-to-stories → /stories-to-ac → /nfr-pack → /risk-log-update → /release-readiness
```

---

## Commands

### `/intake-to-prd`
Converts raw intake material (brainstorm notes, meeting minutes, raw requirements) into a structured PRD.
- **Input:** `00_intake/`
- **Output:** `02_solution/prds/<feature>_PRD.md`
- Separates confirmed facts from assumptions
- Ends with prioritized "Questions for Stakeholders"

---

### `/prd-to-epics`
Breaks a PRD into epics and features scoped as business capability slices.
- **Input:** `02_solution/prds/<feature>_PRD.md`
- **Output:** `02_solution/prds/<feature>_epics.md`
- Each epic includes objective, scope, dependencies, risks, and acceptance boundaries
- No technical implementation detail

---

### `/epics-to-stories`
Generates sprint-ready user stories from epics using vertical slicing.
- **Input:** `02_solution/prds/<feature>_epics.md`
- **Output:** `02_solution/user-stores/<feature>_stories.md`
- INVEST-compliant, includes dependencies and non-goals per story

---

### `/stories-to-ac`
Generates acceptance criteria for each user story using Given/When/Then format.
- **Input:** `02_solution/user-stores/<feature>_stories.md`
- **Output:** `02_solution/acceptance-creteria/<feature>_ac.md`
- Covers negative cases, boundary conditions, role-based behavior, and data states

---

### `/nfr-pack`
Produces a non-functional requirements checklist aligned to the feature.
- **Input:** `02_solution/prds/<feature>_PRD.md`
- **Output:** `02_solution/nfrs/<feature>_nfr.md`
- Covers: performance, security, privacy, reliability, observability, accessibility, compliance

---

### `/risk-log-update`
Identifies and scores delivery, scope, data, and dependency risks.
- **Input:** PRD, epics, stories, NFRs
- **Output:** `04_governance/risk-log/<feature>_risks.md`
- Each risk scored on likelihood and impact (Low / Medium / High) with mitigation and owner

---

### `/decision-record`
Creates an ADR-style decision record for key architectural or product trade-offs.
- **Output:** `04_governance/decision-records/<decision_name>.md`
- Structure: context, decision, alternatives considered, rationale, consequences, open follow-ups

---

### `/release-readiness`
Generates a release readiness checklist across functional, data, security, and ops dimensions.
- **Input:** stories, acceptance criteria, NFRs, risks
- **Output:** `03_delivery/release-notes/<feature>_readiness.md`

---

## Weekly Rhythm

| When | Commands |
|------|----------|
| Monday (start of cycle) | `/intake-to-prd` → `/prd-to-epics` |
| Mid-sprint | `/epics-to-stories` → `/stories-to-ac` |
| Before sprint commit | `/nfr-pack` → `/risk-log-update` |
| Before release | `/decision-record` → `/release-readiness` |
