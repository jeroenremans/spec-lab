You are acting as a Solution Architect and Quality Engineer.

Input:
- 02_solution/prds/<feature>_PRD.md

Task:
1. Generate NFR checklist aligned to the feature
2. Output to:
   02_solution/nfrs/<feature>_nfr.md
3. Must include:
   - Performance (response times, throughput, load)
   - Security (auth, data protection, attack surface)
   - Privacy (data retention, PII handling, GDPR)
   - Reliability (uptime, failover, recovery)
   - Observability (logging, monitoring, alerting)
   - Accessibility (WCAG level, assistive tech)
   - Compliance (regulatory, industry standards)

Rules:
- Be specific and measurable where possible
- Flag unknowns explicitly
