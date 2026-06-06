# Spec-Driven Development Workbench — Risk Log

**Feature:** spec-app  
**Date:** 2026-06-06  
**Sources:** PRD v0.2, Epics, Stories, NFRs  
**Owner convention:** BA = Jeroen Remans; Arch = Solution Architect role

---

## Risk Summary

| ID | Category | Description | Likelihood | Impact | Score |
|----|----------|-------------|-----------|--------|-------|
| R01 | Delivery | Prototype tightly coupled to single project | High | High | Critical |
| R02 | Delivery | Node.js not installed on colleague machines | Medium | High | High |
| R03 | Delivery | Windows/WSL filesystem path handling | Medium | Medium | Medium |
| R04 | Technical | Mermaid requires `unsafe-eval` — breaks CSP | Medium | Medium | Medium |
| R05 | Delivery | Git not in PATH on colleague machines | Medium | Medium | Medium |
| R06 | Scope | Scope creep toward SaaS or multi-user | Medium | High | High |
| R07 | Technical | Save conflict: app + Claude Code write same file | Medium | Medium | Medium |
| R08 | Technical | Git edge cases crash backend | Medium | Low | Low-Medium |
| R09 | Adoption | Colleagues prefer existing tools; adoption stalls | Medium | Medium | Medium |
| R10 | Technical | Config file corruption blocks app startup | Low | High | Medium |
| R11 | Dependency | EasyMDE writes spec content to browser storage | Low | Medium | Low-Medium |
| R12 | Dependency | Transitive dependency has incompatible license | Low | Medium | Low-Medium |
| R13 | Data | Spec files contain PII — GDPR obligation unclear | Low | Medium | Low-Medium |
| R14 | Compliance | we+ internal tool approval delays pilot rollout | Low | Medium | Low-Medium |
| R15 | Delivery | Vite build step unfamiliar — onboarding friction | Low | Low | Low |

---

## Detailed Risk Register

### R01 — Prototype tightly coupled to single project
**Category:** Delivery  
**Likelihood:** High  
**Impact:** High

**Description:** The existing `index.html` prototype hardcodes paths and serves files relative to a single directory. Multi-project support (EP2) requires a significant backend refactor — project path must become a runtime parameter, file serving must be scoped per project, and the config persistence layer must be built from scratch. Underestimating this refactor is the most likely cause of sprint failure.

**Mitigation:**
- Treat EP1 + EP2 as a single foundational sprint; do not start EP3–EP7 until multi-project switching is proven end-to-end
- Extract and test the backend file-serving layer before building UI on top of it
- Prototype the project switcher with a dummy file tree first to validate the architecture

**Owner:** BA (Jeroen Remans)

---

### R02 — Node.js not installed on colleague machines
**Category:** Delivery  
**Likelihood:** Medium  
**Impact:** High

**Description:** The Vite build step requires Node.js at build time. Colleagues who only have Python installed will not be able to build or update the frontend. If the build artefact is not committed to the repo, onboarding fails silently with no clear error.

**Mitigation:**
- Commit the production Vite build output (`dist/`) to the repo so colleagues without Node.js can still run the app
- Document Node.js as a **dev-only** dependency; it is not needed to run the app after build
- Include a `Makefile` or `run.sh` that checks for Node.js and prints a clear message if absent

**Owner:** BA (Jeroen Remans)

---

### R03 — Windows/WSL filesystem path handling
**Category:** Delivery  
**Likelihood:** Medium  
**Impact:** Medium

**Description:** Python's `pathlib` and `os.path` behave differently between macOS/Linux and WSL. Registered project paths entered as WSL paths (`/mnt/c/...`) may break if the server is not WSL-aware. Path separator mismatches can cause 404s or directory traversal false-positives on the security check.

**Mitigation:**
- Use `pathlib.Path` throughout the backend (not string concatenation)
- Add an explicit test: register a WSL path with a space → browse files → save a file
- Document the supported path format for Windows users in the README

**Owner:** BA (Jeroen Remans)

---

### R04 — Mermaid requires `unsafe-eval` — breaks CSP
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** Medium

**Description:** Mermaid's diagram compiler uses `Function()` or `eval()` internally, which is blocked by a strict Content Security Policy (`script-src 'self'`). If `unsafe-eval` is needed, it weakens the CSP for the entire app — not just Mermaid. This is a known issue with Mermaid v9 and earlier; v10+ has partial mitigation.

**Mitigation:**
- Investigate Mermaid v10's CSP compatibility before implementation
- If `unsafe-eval` is unavoidable, scope it to a sandboxed `<iframe>` that renders only Mermaid output
- If sandboxing adds too much complexity for v1, defer Mermaid rendering to v2 and render raw code blocks with a "Diagram rendering coming soon" notice
- Document the decision as an ADR

**Owner:** BA (Jeroen Remans)

---

### R05 — Git not in PATH on colleague machines
**Category:** Delivery  
**Likelihood:** Medium  
**Impact:** Medium

**Description:** Git features (Modified indicators, diff view, Changes section) require `git` available in the system PATH. On some Windows machines, git may be installed but not added to the WSL PATH. This causes silent failure if the app does not explicitly check and communicate the absence.

**Mitigation:**
- On startup, explicitly check `git --version` and log result
- If git is absent: start app in file-only mode, display a persistent notice in the sidebar ("Git not available — install git to enable change tracking")
- Covered by NFR-R1; ensure the AC test for this passes before release

**Owner:** BA (Jeroen Remans)

---

### R06 — Scope creep toward SaaS or multi-user
**Category:** Scope  
**Likelihood:** Medium  
**Impact:** High

**Description:** Once colleagues see the workbench, requests for cloud hosting, shared access, real-time collaboration, or Jira/Confluence integration will come. Accommodating these in v1 would destabilize the architecture and delay delivery significantly.

**Mitigation:**
- Publish a clear "Out of Scope v1" list in the README and in the Decisions Log (PRD §11)
- Create a decision record (ADR) explicitly stating: local-only, single user, no cloud for v1
- Capture all enhancement requests in `04_governance/assumptions/` for v2 prioritization
- Defer MCP integrations to phase 3 as already documented

**Owner:** BA (Jeroen Remans)

---

### R07 — Save conflict: app and Claude Code write the same file simultaneously
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** Medium

**Description:** A BA may have a spec file open in the editor while Claude Code's `/intake-to-prd` or another command also writes to that file. The app's PUT save will overwrite Claude Code's output, or vice versa. Last write wins — no merge occurs. Content loss is possible.

**Mitigation:**
- Document in the workflow guide: do not have a file open in the editor while running Claude Code commands that write to the same file
- In v1, no technical mitigation is required (last-write-wins is acceptable per PRD)
- For v2: consider a file-changed-on-disk detection that warns the user before overwriting

**Owner:** BA (Jeroen Remans)

---

### R08 — Git edge cases crash backend
**Category:** Technical  
**Likelihood:** Medium  
**Impact:** Low

**Description:** The backend calls `git status` and `git diff` against the project repo. Edge cases — detached HEAD, repo with zero commits, `.git` directory missing, corrupted repo — can cause `git` to return non-zero exit codes or unexpected output. If the backend does not handle these, it may return 500 errors that break the sidebar or diff view.

**Mitigation:**
- Wrap all `subprocess` git calls in try/except; return structured `{ok: false, reason: "..."}` JSON on failure
- Test each edge case explicitly: no commits, detached HEAD, missing `.git`
- Covered by AC-6.1.4 and AC-6.1.6; must pass before release

**Owner:** BA (Jeroen Remans)

---

### R09 — Colleagues prefer existing tools; adoption stalls
**Category:** Adoption  
**Likelihood:** Medium  
**Impact:** Medium

**Description:** Some colleagues may already use Notion, Confluence, or shared Google Docs for spec work. If the workbench requires a behaviour change (clone repo, run Python, use Claude Code commands) without a clear productivity win, adoption may stall after the pilot.

**Mitigation:**
- Pilot with 1–2 colleagues who are already Claude Code users (lower friction)
- Measure the "time to PRD v1" metric explicitly; show the before/after delta
- Build the workflow guide (EP7) before broader rollout — onboarding must be self-serve
- Gather feedback after each pilot project; fix the top friction point before next rollout

**Owner:** BA (Jeroen Remans)

---

### R10 — Config file corruption blocks app startup
**Category:** Technical  
**Likelihood:** Low  
**Impact:** High

**Description:** If the JSON config file storing registered projects becomes malformed (interrupted write, manual edit error), the app fails to parse it on startup. Without graceful recovery, the user loses their project list and cannot start the app without manual intervention.

**Mitigation:**
- Write config atomically: write to a `.tmp` file, then rename — prevents partial writes
- On parse failure: rename corrupt file to `.bak`, initialize fresh config, log warning
- Covered by AC-2.3.3 and NFR-R2; must pass before release

**Owner:** BA (Jeroen Remans)

---

### R11 — EasyMDE writes spec content to browser storage
**Category:** Dependency  
**Likelihood:** Low  
**Impact:** Medium

**Description:** EasyMDE has an autosave feature that stores editor content in `localStorage`. If autosave is not explicitly disabled, spec content (which may be confidential) persists in the browser beyond the session. This violates NFR-PR5.

**Mitigation:**
- Explicitly set `autosave: { enabled: false }` in EasyMDE initialisation (already done in prototype — verify it remains in the refactored version)
- Add a unit test: open editor, close browser, inspect localStorage → key must be absent

**Owner:** BA (Jeroen Remans)

---

### R12 — Transitive dependency has incompatible license
**Category:** Dependency  
**Likelihood:** Low  
**Impact:** Medium

**Description:** A transitive npm or Python dependency may carry a GPL or LGPL license that creates an obligation incompatible with we+ internal tool distribution. Direct dependencies (EasyMDE MIT, marked.js MIT, Mermaid MIT, Flask BSD) are safe, but transitive deps are not yet audited.

**Mitigation:**
- Run `npx license-checker --failOn GPL` and `pip-licenses --fail-on GPL` as part of the build
- Block release if any GPL dependency is detected
- Covered by NFR-C1; must complete before v1 release

**Owner:** BA (Jeroen Remans)

---

### R13 — Spec files contain PII — GDPR obligation unclear
**Category:** Data  
**Likelihood:** Low  
**Impact:** Medium

**Description:** Spec files may contain names of stakeholders, clients, or end-users (e.g., meeting minutes, personas). While the app itself does not process PII, it provides read/write access to files that may contain it. On projects subject to GDPR, the data controller obligations for those files must be clarified.

**Mitigation:**
- Confirm with legal/DPO before onboarding any client project data to the workbench
- Document in the README: "This tool accesses files on your local filesystem. You are responsible for ensuring the content of those files complies with applicable data protection regulations."
- Flag as NFR-PR4 unknown; do not block v1 pilot (internal we+ projects have lower risk)

**Owner:** BA (Jeroen Remans)

---

### R14 — we+ internal tool approval delays pilot rollout
**Category:** Compliance  
**Likelihood:** Low  
**Impact:** Medium

**Description:** we+ IT or security may require a formal review before allowing colleagues to install and run the tool locally. If a review process is needed, it could delay the pilot by weeks.

**Mitigation:**
- Proactively check with IT/security whether a review is required for internal Python tools
- Prepare a one-page security summary (local-only, no network, no PII stored, no cloud calls) to accelerate any review
- Run `pip audit` and `npm audit` outputs as evidence

**Owner:** BA (Jeroen Remans)

---

### R15 — Vite build step unfamiliar — onboarding friction
**Category:** Delivery  
**Likelihood:** Low  
**Impact:** Low

**Description:** Colleagues who only know `python app.py` may be confused by a required `npm run build` step. If the build output is committed to the repo (see R02 mitigation), this risk is largely eliminated for end users. It remains a friction point only for developers who want to modify the frontend.

**Mitigation:**
- Commit built assets to repo (R02 mitigation covers this)
- Document developer setup separately from end-user setup in the README
- Provide a `make dev` command that runs both `npm run dev` and `python app.py` for developer convenience

**Owner:** BA (Jeroen Remans)
