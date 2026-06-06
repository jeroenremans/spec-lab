# ADR-004 — One Active Project at a Time (No Multi-Panel)

**Date:** 2026-06-06  
**Status:** Accepted  
**Deciders:** Jeroen Remans

---

## Context

The app supports multiple registered projects. A UX model must be chosen for how users interact with multiple projects: can they view multiple projects simultaneously, or only one at a time?

---

## Decision

The app supports **one active project at a time**. A project switcher in the top nav allows switching between registered projects. Switching replaces the current project view entirely.

---

## Alternatives Considered

**A — Simultaneous multi-project view (tabs or split panels)**
- Users could compare specs across two projects at once
- Requires: tab state management, independent sidebar instances per project, scoped git status per tab
- Significant UI and backend complexity — each project needs its own git and file context
- The primary use case (a BA working on one client project per session) does not require simultaneous views
- Risk of cross-project confusion: tagging or editing a file in the wrong project

**B — One project at a time with switcher (chosen)**
- Simple mental model: one file tree, one active context, one git repo
- Switcher in nav shows the active project name; clicking opens a dropdown of registered projects
- Switching replaces the current view — no state bleed between projects
- Backend scoping is trivial: all file/git operations use the single active project path

---

## Rationale

BAs and PMs work on one client project at a time in a session. There is no documented need to compare specs side-by-side across different project repos. The added complexity of multi-panel support would not deliver proportional value for the v1 use case and would increase the risk of errors (editing the wrong project's files).

---

## Consequences

**Positive:**
- Simple backend: one active project path in server state; all endpoints scoped to it
- Simple UI: one sidebar, one file tree, no tab management
- No cross-project file access or confusion

**Negative:**
- Users who need to compare two projects must switch back and forth manually
- No way to have two browser tabs open on different projects using the same server instance (both would show the last-switched project)

---

## Open Follow-Ups

- If colleagues report needing to cross-reference two projects frequently, evaluate a read-only "compare" mode in v2 (open two files side by side, no editing in compare mode)
- Document in the README that opening two browser tabs does not give two independent project contexts
