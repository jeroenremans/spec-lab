# NFR — Flagged Unknowns

**Derived from:** `spec-app_PRD.md` v0.3  
**Date:** 2026-06-06  
**Status:** Draft

---

## 8. Flagged Unknowns — Summary

| # | Unknown | Impact | Recommended action |
|---|---------|--------|--------------------|
| U1 | Mermaid may require `unsafe-eval` in CSP | Security | Investigate Mermaid CSP requirements before release |
| U2 | EasyMDE/marked.js localStorage or IndexedDB usage | Privacy | Audit dependency storage behaviour |
| U3 | Files > 200KB render performance | Performance | Define size limit or lazy-load strategy in v2 |
| U4 | Multi-user / concurrent use behaviour | Performance | Document as unsupported in v1 README |
| U5 | GDPR obligations for spec files containing names | Privacy | Confirm with legal before client project onboarding |
| U6 | we+ internal tool approval process | Compliance | Confirm with IT/security before rollout |
| U7 | Transitive dependency license audit | Compliance | Run `license-checker` and `pip-licenses` before v1 release |
