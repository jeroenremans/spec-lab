# Problem Statement — Spec-Driven Development Workbench

**Date:** 2026-06-06

---

## The Core Problem

BA and PM teams at we+ produce specifications in isolation. Each spec is a one-off document — a Word file, a Confluence page, or a markdown file with no connection to the other artifacts in the same project. There is no standard structure, no traceability between requirements and stories, and no consistent pipeline from raw intake to delivery-ready specs.

When specs exist, they are hard to find, hard to navigate, and hard to review. Review feedback arrives in email or chat — not in the document itself. Decisions are made verbally and forgotten. Risk logs are kept in separate Excel files that nobody updates.

The result: specs are fragile. Quality depends on who wrote them and what they remembered to include. Delivery teams spend time clarifying requirements that should have been specified upfront. Re-work is common.

---

## Who is affected

| Persona | Pain |
|---------|------|
| Business Analyst | Spends time on formatting and consistency instead of content; no tooling to enforce standards |
| Product Manager | No single view of spec maturity; decisions are not documented; can't see what changed |
| Developer / Tech Lead | Receives ambiguous specs; no way to see what changed; has to ask the BA for context |

---

## What we are NOT solving

- Real-time collaboration across teams (chat, comments, live cursors)
- Replacing Jira/Confluence for ticket management
- Automating stakeholder approval workflows
- Solving spec quality for teams without any BA/PM discipline

---

## The Opportunity

Claude Code already provides the pipeline: `/intake-to-prd` → `/prd-to-epics` → `/epics-to-stories` → `/stories-to-ac`. What is missing is a **shared workspace** — a local app where the artifacts produced by these commands can be viewed, reviewed, tagged, and tracked by the whole team (BA, PM, Dev) without needing to open a terminal or know markdown.

The spec workbench makes the Claude Code pipeline visible and collaborative.

---

## Problem Statement addendum — Theme Switcher (2026-06-07)

**Specific problem:** The Spec Workbench has a single fixed visual theme. Team members who work long sessions suffer eye fatigue. PMs cannot switch to a client-presentable look for screen shares. Developers who work exclusively in dark-mode environments find the light default jarring.

**Who is affected:** All three personas — BA (comfort for long sessions), PM (presentability for demos), Dev (dark mode alignment).

**What is NOT being solved:** Custom theme creation, per-document themes, font size personalisation.

**The opportunity:** The app's CSS custom-property architecture already supports theming. Adding a switcher requires CSS theme blocks + a minimal control — no backend changes, no data migration, no architectural risk.
