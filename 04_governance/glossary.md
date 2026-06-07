

# Glossary — Spec-Driven Development Workbench

_This glossary defines abbreviations and domain terms used across the spec pipeline. Maintained in `04_governance/glossary.md` and editable via the in-app editor._

---

## Abbreviations

| Term | Full form | Definition |
|------|-----------|-----------|
| **AC** | Acceptance Criteria | Conditions that a user story must satisfy to be accepted. Written in Given/When/Then format. See `02_solution/acceptance-creteria/` |
| **ADR** | Architecture Decision Record | A document capturing a key architectural or product decision, the alternatives considered, and the rationale. See `04_governance/decision-records/` |
| **BA** | Business Analyst | The person responsible for gathering, structuring, and documenting requirements and specifications |
| **EP** | Epic | A large body of work that can be broken down into smaller user stories. Labelled EP1, EP2, etc. See `02_solution/prds/<feature>_epics.md` |
| **INVEST** | Independent, Negotiable, Valuable, Estimable, Small, Testable | A quality checklist for user stories. Every story should meet all 6 criteria |
| **MCP** | Model Context Protocol | A protocol that allows Claude Code to connect to external tools (Jira, Confluence, Notion, etc.) |
| **NFR** | Non-Functional Requirement | Requirements that define system qualities rather than specific behaviours: performance, security, privacy, reliability, accessibility, etc. See `02_solution/nfrs/` |
| **PM** | Product Manager | The person responsible for product vision, prioritization, and stakeholder alignment |
| **PRD** | Product Requirements Document | The primary spec artifact describing a feature or product: problem, goals, scope, personas, flows, requirements. See `02_solution/prds/` |
| **RICE** | Reach, Impact, Confidence, Effort | A prioritization scoring model for features |
| **S** | Story | A user story. Labelled S1.1, S2.3, etc. See `02_solution/user-stores/` |
| **VTT** | Web Video Text Tracks | A file format for timed text (subtitles, transcripts). Used here for meeting transcripts. Extension: `.vtt` |
| **we+** | we+ (company name) | The consulting firm this tool is built for and by |
| **WSJF** | Weighted Shortest Job First | A prioritization model from SAFe: (Business Value + Time Criticality + Risk Reduction) / Job Size |

---

## Pipeline Phases

| Phase | Folder | Purpose |
|-------|--------|---------|
| **Intake** | `00_intake/` | Raw input: brainstorm notes, meeting minutes, stakeholder emails, raw requirements |
| **Discovery** | `01_discovery/` | Structured understanding: personas, journey maps, problem statements, research notes |
| **Solution** | `02_solution/` | Designed specs: PRDs, epics, user stories, AC, NFRs |
| **Delivery** | `03_delivery/` | Release artefacts: cutover plans, release notes, support readiness |
| **Governance** | `04_governance/` | Decisions, risks, assumptions, glossary |

---

## Slash Commands

| Command | When to use |
|---------|-------------|
| `/intake-to-prd` | Convert raw intake into a structured PRD draft |
| `/prd-to-epics` | Break a PRD into epics with scope and dependencies |
| `/epics-to-stories` | Generate sprint-ready user stories from epics |
| `/stories-to-ac` | Generate Given/When/Then acceptance criteria per story |
| `/nfr-pack` | Generate NFR checklist (performance, security, privacy, etc.) |
| `/risk-log-update` | Identify and score delivery, scope, and technical risks |
| `/decision-record` | Create an ADR for a key architectural or product decision |
| `/release-readiness` | Generate a go/no-go release checklist |
| `/grill-me` | Stress-test a plan through relentless questioning |

---

## Document Status Tags

These tags can be inserted into any spec file to flag content for follow-up.

| Tag | Color | Meaning |
|-----|-------|---------|
| `[TODO]` | Orange | Action item — something must be done here before this section is complete |
| `[REVIEW]` | Yellow | Needs review — flag for PM or BA to check this section |
| `[REWORK]` | Red | Content is wrong or insufficient — must be rewritten |
| `[CLARIFY]` | Blue | Ambiguous — needs clarification from a stakeholder or subject matter expert |
| `[COMMENT]` | Purple | Non-blocking note or context for the reader |

> **Note:** Tags wrapped in backticks (e.g. `` `[TODO]` ``) or inside fenced code blocks are documentation examples and are excluded from sidebar tag scanning.