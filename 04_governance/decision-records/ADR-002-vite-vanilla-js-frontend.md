# ADR-002 — Vite + Vanilla JS Modules (No Framework)

**Date:** 2026-06-06  
**Status:** Accepted  
**Deciders:** Jeroen Remans

---

## Context

The existing prototype is a single `index.html` file of 1300+ lines containing all CSS, JS, and HTML inline. This is already hard to maintain and will grow further. A frontend approach must be chosen for the refactored app.

The brainstorm document originally mentioned Angular as the frontend. The team also uses Angular on client projects.

---

## Decision

Use **Vite + vanilla JavaScript ES modules** as the frontend build setup. No UI framework (no Angular, no React, no Vue). Dependencies (EasyMDE, marked.js, Mermaid) are bundled at build time. Built assets are committed to the repo.

---

## Alternatives Considered

**A — Angular**
- Familiar to the team from client projects
- Provides component model, routing, dependency injection
- Requires: Node.js, Angular CLI, `ng build` → produces bundle
- Adds significant build complexity for what is essentially a single-page local tool
- Angular's compilation step, zone.js, and bundle size are disproportionate to the app's UI complexity
- Colleagues without Angular experience cannot contribute to the frontend

**B — Keep single `index.html` (no build step)**
- Zero build complexity; works by opening the file directly
- Already proven fragile at 1300 lines; will become unmaintainable beyond 2000 lines
- Cannot modularize (no ES module imports in a single file without a server)
- CDN dependencies remain — breaks offline requirement (NFR-PR3)

**C — React or Vue**
- Lighter than Angular; component model available
- Adds framework concepts unfamiliar to the existing prototype codebase
- Still requires a build step and framework runtime
- No existing code to migrate from; would require a full rewrite

**D — Vite + vanilla JS modules (chosen)**
- Splits JS into logical modules (`editor.js`, `tree.js`, `git.js`, `viewer.js`, etc.) without a framework
- Vite handles bundling, asset fingerprinting, and dev server hot reload
- Zero framework concepts; JS is plain and readable
- Existing prototype logic can be migrated incrementally, module by module
- Built `dist/` committed to repo so colleagues without Node.js can run the app

---

## Rationale

The app's UI is fundamentally a file viewer + editor + sidebar. It does not have complex state management, routing beyond "which file is open", or component reuse patterns that justify a framework. The existing prototype already implements all the logic correctly in plain JS.

The only problem with the current prototype is file size and maintainability — which Vite + ES modules solves directly, without adding framework complexity.

Committing the built assets removes Node.js as a runtime dependency, keeping the "clone + `python app.py`" setup promise intact.

---

## Consequences

**Positive:**
- Existing prototype JS can be migrated function-by-function into modules without a rewrite
- No framework runtime overhead; fast load
- No Node.js required to run the app (only to build/develop)
- All dependencies bundled; works offline (NFR-PR3)
- Any developer can read and modify the JS without framework knowledge

**Negative:**
- No reactive state management; manual DOM updates required (acceptable given app simplicity)
- Vite adds a build step for developers who want to modify the frontend
- Module boundaries must be designed carefully upfront; poor decomposition is hard to refactor later
- TypeScript is not included (plain JS only) — no compile-time type safety

---

## Open Follow-Ups

- Define module boundaries before starting implementation: proposed split is `main.js`, `tree.js`, `viewer.js`, `editor.js`, `git.js`, `tags.js`, `projects.js`
- Decide whether to add JSDoc type annotations for editor tooling support (no TypeScript compilation needed)
- If the app grows significantly in v2, reconsider TypeScript adoption at that point
