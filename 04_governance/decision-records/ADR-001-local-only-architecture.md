# ADR-001 — Local-Only Architecture (No SaaS)

**Date:** 2026-06-06  
**Status:** Accepted  
**Deciders:** Jeroen Remans

---

## Context

The spec workbench needs to serve spec files, run git commands, and write files to disk. A deployment model must be chosen: run locally on each user's machine, or host centrally as a SaaS/shared server.

Spec files for client projects may contain confidential requirements, stakeholder names, and architectural decisions. The primary users are we+ BAs and PMs working across multiple client repos on their local machines.

---

## Decision

The app runs **locally only** — each user runs their own instance of the Python Flask server on their own machine. There is no shared server, no cloud deployment, and no remote access.

---

## Alternatives Considered

**A — SaaS (cloud-hosted)**
- Single URL for all users; no local install required
- Requires hosting, auth, multi-tenancy, data isolation between projects
- Spec file content would leave the local machine — unacceptable for confidential client data without a formal security and legal review
- Build and operational complexity is disproportionate to the problem size (internal BA tooling)

**B — Shared local server on company network**
- One instance runs on a shared machine; colleagues access via internal IP
- Requires a machine to be always-on; network access needed; file paths are remote
- Adds network latency; file writes over network are error-prone
- Git commands would run in a single shared context — not per-user

**C — Local-only (chosen)**
- Each user runs `python app.py` on their machine against their local repo clone
- No data leaves the machine; no auth needed; no hosting cost
- Consistent with how developers already work with local git repos
- Simplest possible deployment model

---

## Rationale

The confidentiality of client spec data is non-negotiable. A local-only model eliminates the data protection risk entirely without requiring legal review, security architecture, or auth implementation. It also matches how the target users (BAs/PMs) already work — they clone repos locally and use local tools.

The operational overhead of a SaaS deployment (hosting, auth, multi-tenancy) would dwarf the value of the tool at this stage.

---

## Consequences

**Positive:**
- No data leaves the user's machine
- No hosting cost or infrastructure to maintain
- Simple setup: clone + run one command
- No auth layer needed

**Negative:**
- Each user must run their own instance — no shared real-time view
- Colleagues on different machines cannot see each other's unsaved edits
- Updates require each user to pull the latest repo and restart
- If a colleague's git repo is on a network drive, file serving may be slow (unsupported)

---

## Open Follow-Ups

- If we+ wants team-wide visibility of spec maturity across projects, a read-only shared dashboard could be added in v3 — this does not require changing the local-first model
- Confirm with IT/security that local-only Python tools do not require formal approval (Risk R14)
