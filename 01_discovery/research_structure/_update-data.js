// One-time data update script — run with: node _update-data.js
// Delete this file after running.

const fs = require('fs');
const base = __dirname + '/data/';

const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));
const find  = (arr, key) => arr.find(d => d.key === key);
function upsert(arr, doc) {
  const i = arr.findIndex(d => d.key === doc.key);
  if (i === -1) arr.push(doc); else arr[i] = doc;
}
function addAiTask(doc, task) {
  if (!doc.aiTasks.find(t => t.name === task.name)) doc.aiTasks.push(task);
}

// ═══════════════════════════════════════════════════════════════════════════
// docs-intake.json — project-constitution: add MUST/SHOULD/MAY + exceptions
// ═══════════════════════════════════════════════════════════════════════════
const intake = read('docs-intake.json');
const pc = find(intake, 'project-constitution');
if (!pc.template.includes('MUST')) {
  pc.template +=
    '\n## Constraints\n\n### MUST (Non-negotiable — align with or document exception)\n\n### SHOULD (Default behaviour — override requires justification)\n\n### MAY (Optional — team decision)\n\n## Exceptions Process\n> To override a MUST: open a PR, document the exception below, get approval from Tech Lead + Security Officer.\n\n| Exception | Org section overridden | Approved by | Review date |\n|---|---|---|---|\n\n## Review Cycle\nFull review: every 90 days or on major tech change.\nLast reviewed: [date]\n';
}
write('docs-intake.json', intake);
console.log('intake done');

// ═══════════════════════════════════════════════════════════════════════════
// docs-discovery.json — add Spike / Research document
// ═══════════════════════════════════════════════════════════════════════════
const discovery = read('docs-discovery.json');
upsert(discovery, {
  phase: 'discovery', key: 'spike',
  title: 'Spike / Research', sub: 'Technical exploration before committing to spec',
  path: '[project]/01_discovery/spike-[topic].md',
  owner: 'Tech Lead',
  reviewers: ['Business Analyst', 'Senior Developer'],
  signoff: '',
  lifecycle: 'One-time — archived after decision; re-validate if unused after 90 days',
  trigger: 'Technical uncertainty blocks spec writing or architecture decision',
  doel: 'Explore approaches in parallel before committing so specs are written on validated ground, not assumptions.',
  inputs: ['Epic or feature describing the problem', 'Technical constraints (NFR, existing stack)', 'Identified unknowns'],
  outputs: ['Recommended approach with rationale', 'Alternatives considered', 'Decision log', 'Refresh cadence for re-validation'],
  flow: [
    {name:'Uncertainty Identified', sub:'Blocks spec writing', type:'trigger'},
    {name:'Define Exploration', sub:'TL scopes the spike', type:'step'},
    {name:'Parallel Exploration', sub:'1–2 approaches prototyped', type:'step'},
    {name:'Decision', sub:'TL + BA pick approach', type:'step'},
    {name:'Archived + Linked', sub:'Spike linked to spec/ADR', type:'output'},
  ],
  note: 'A spike older than 90 days without a linked decision should be marked stale and re-validated before use.',
  refs: [{dir:'→',key:'adr'},{dir:'→',key:'feature'}],
  creation: [
    {name:'Define unknowns', method:'Problem framing', tools:'Miro, Claude', ai:true},
    {name:'Design exploration paths', method:'Parallel option design', tools:'Claude, draw.io', ai:true},
    {name:'Build minimal proof', method:'Timebox (1–3 days)', tools:'IDE, Postman, Claude', ai:false},
    {name:'Document findings', method:'Decision log writing', tools:'Markdown, Claude', ai:true},
  ],
  template:
    '# Spike: [Topic]\n\n**Status:** In Progress / Concluded\n**Date:** [date]\n**Timebox:** [N] days\n**Staleness warning:** Re-validate if unused after 90 days from [date]\n\n## Problem / Question\n\n## What We Need to Know\n\n## Approaches Explored\n\n### Option A: [name]\n**Approach:**\n**Findings:**\n**Pros:**\n**Cons:**\n**Effort:**\n\n### Option B: [name]\n**Approach:**\n**Findings:**\n**Pros:**\n**Cons:**\n**Effort:**\n\n## Decision\n\n**Chosen:** Option [A/B/other]\n**Rationale:**\n\n## Decision Log\n| Date | Question | Options | Resolution | Impact |\n|---|---|---|---|---|\n\n## Linked Artifacts\n- ADR: [link if architectural decision was made]\n- Feature/Spec: [link]\n- Refresh cadence: [date or condition for re-validation]\n',
  aiTasks: [
    {
      name: 'Spike Planner',
      persona: 'Solution Architect',
      objective: 'Define parallel exploration paths and timebox for the spike.',
      prompt: 'You are a Solution Architect. Based on this technical uncertainty, define a spike plan: (1) What specific question must be answered? (2) What are 2-3 feasible approaches to explore? (3) What is the minimum viable proof for each? (4) What is a realistic timebox (1-3 days)? (5) What are the go/no-go criteria per option? Output a structured spike plan.'
    },
    {
      name: 'Findings Synthesiser',
      persona: 'Tech Lead',
      objective: 'Synthesise exploration findings into a clear decision recommendation.',
      prompt: 'You are a Tech Lead. Review these spike findings: (1) Which option best fits the constraints (NFR, stack, team skill)? (2) What are the risks of the chosen option? (3) What would change this decision? (4) Does this require an ADR? Output: recommendation + rationale + conditions that would invalidate the choice.'
    },
  ],
});
write('docs-discovery.json', discovery);
console.log('discovery done');

// ═══════════════════════════════════════════════════════════════════════════
// docs-solution.json — epic, feature, story, ac upgrades
// ═══════════════════════════════════════════════════════════════════════════
const solution = read('docs-solution.json');

// Epic: add Spike Planner AI task
addAiTask(find(solution, 'epic'), {
  name: 'Spike Planner',
  persona: 'Solution Architect',
  objective: 'Identify technical uncertainties in this epic that need a spike before writing feature specs.',
  prompt: 'You are a Solution Architect. Review this epic for technical uncertainties that should be explored via a spike before writing feature specs: (1) Unclear implementation approach, (2) New or unfamiliar technology, (3) Performance unknowns, (4) Integration unknowns. For each: name it, estimate risk (H/M/L), propose a spike question, suggest a timebox. Output as a spike candidate list.',
});

// Feature: add traceability matrix to template + Clarification Generator AI task
const feature = find(solution, 'feature');
if (!feature.template.includes('Traceability')) {
  feature.template += '\n## Traceability Matrix\n| Story | AC | Task | Test |\n|---|---|---|---|\n| US-001 | AC-001 | T-01 | TC-01 |\n';
}
addAiTask(feature, {
  name: 'Clarification Generator',
  persona: 'Business Analyst',
  objective: 'Surface ambiguities in this feature and generate structured options for stakeholder resolution.',
  prompt: 'You are a Business Analyst. Review this feature for ambiguities: (1) Terms with multiple valid interpretations, (2) Business rules that conflict or overlap, (3) Scenarios not covered by ACs, (4) Assumptions stated as facts. For each: write the clarification question, then 2-3 concrete options with trade-offs pre-filled so the stakeholder only needs to choose. Format as CLR-NNN entries ready for the Clarification Log.',
});

// Story: add US-XXX-NNN ID format + Open Questions section + Clarification Generator AI task
const story = find(solution, 'story');
story.template =
  '# User Story: US-XXX-NNN [Name]\n\n**As a** [role],\n**I want to** [action],\n**so that** [value].\n\nFeature: [link]\nStatus: draft / in review / approved / in sprint / done\nPoints: ?\n\n## Open Questions\n| ID | Question | Options | Resolution | Owner |\n|---|---|---|---|---|\n| Q-01 | | A: ... / B: ... | Pending | |\n\n## Out of Scope\n\n## Notes\n\n## Linked Documents\n- Acceptance Criteria: ac.md\n- NFR: nfr.md (if applicable)\n';
addAiTask(story, {
  name: 'Clarification Generator',
  persona: 'Business Analyst',
  objective: 'Surface ambiguities in this story before refinement.',
  prompt: 'You are a Business Analyst. Review this user story for ambiguities before refinement: (1) Is the user role specific enough? (2) Is the action clear enough to test? (3) Is the value measurable? (4) Are there implicit business rules not stated? For each: write the question with 2-3 options + trade-offs. Format as Q-NNN entries for the Open Questions section.',
});

// AC: add AC-NNN/EC-NNN IDs + compliance checklist
const ac = find(solution, 'ac');
ac.template =
  '# Acceptance Criteria: [Story Name] (US-XXX-NNN)\n\nStory: [link to story.md]\nFeature: [link]\nStatus: draft / approved\n\n## Happy Path\n\n### AC-001: [Short name]\nWHEN [condition]\nTHE [actor] SHALL [observable behaviour]\n\n## Edge Cases\n\n### EC-001: [Short name]\nWHEN [condition]\nTHE [actor] SHALL [observable behaviour]\n\n## Error Scenarios\n\n### AC-002: [Short name]\nWHEN [condition]\nTHE [actor] SHALL [observable behaviour]\n\n## Compliance Checklist\n- [ ] GDPR: Does this feature process personal data?\n  - [ ] Consent mechanism in place\n  - [ ] Data retention period defined\n  - [ ] Deletion pathway documented\n- [ ] Auth: All sensitive operations require authenticated session\n- [ ] Logging: No PII written to logs\n- [ ] Encryption: Sensitive data encrypted at rest and in transit\n\n## Notes\n';

write('docs-solution.json', solution);
console.log('solution done');

// ═══════════════════════════════════════════════════════════════════════════
// docs-delivery.json — dod upgrades + add task-breakdown
// ═══════════════════════════════════════════════════════════════════════════
const delivery = read('docs-delivery.json');

// DoD: add tasks ≤ 8h + handoff ceremony checklist
const dod = find(delivery, 'dod');
if (!dod.template.includes('8h')) {
  dod.template = dod.template.replace(
    '## Process\n- [ ] PO has accepted the story\n- [ ] Story moved to Done in backlog tool\n',
    '## Task Quality\n- [ ] No single implementation task exceeded 8h\n- [ ] All tasks have a clear done-when criterion\n\n## Process\n- [ ] PO has accepted the story\n- [ ] Story moved to Done in backlog tool\n\n## Feature Handoff Ceremony (end of feature, not per story)\n- [ ] Spec walkthrough done with dev team\n- [ ] Task sequence agreed and parallel tasks identified\n- [ ] All open questions in Clarification Log resolved\n- [ ] Test environment ready\n- [ ] Stakeholder sign-off received\n- [ ] Consistency Analysis gate: PASS\n'
  );
}

// Add task-breakdown
upsert(delivery, {
  phase: 'delivery', key: 'task-breakdown',
  title: 'Task Breakdown', sub: 'Discrete implementation tasks per feature with traceability',
  path: '[project]/03_delivery/tasks-[feature].md',
  owner: 'Tech Lead',
  reviewers: ['Developer', 'Senior Developer'],
  signoff: 'Tech Lead',
  lifecycle: 'Per feature — created during sprint planning, updated as work progresses',
  trigger: 'Feature approved, sprint planning starts',
  doel: 'Break a feature into discrete tasks (≤8h each) with traceability to stories and ACs, and mark which tasks can run in parallel.',
  inputs: ['Feature doc', 'User stories', 'Acceptance criteria (ac.md)', 'Technical plan / architecture'],
  outputs: ['Discrete tasks ≤8h', 'Parallelism map [P]', 'Traceability matrix (story → task → test)', 'Affected files per task'],
  flow: [
    {name:'Feature Approved', sub:'Sprint planning starts', type:'trigger'},
    {name:'Task Design', sub:'TL + Senior Dev', type:'step'},
    {name:'Team Review', sub:'Dev team check', type:'step'},
    {name:'Sign-off TL', sub:'Tasks committed to sprint', type:'signoff'},
    {name:'In Sprint', sub:'Updated as work progresses', type:'output'},
  ],
  note: 'Tasks exceeding 8h must be split. Mark parallel-executable tasks with [P]. Every task must trace to at least one story or AC.',
  refs: [{dir:'←',key:'feature'},{dir:'←',key:'ac'},{dir:'←',key:'story'}],
  creation: [
    {name:'Analyse feature and ACs', method:'Requirements breakdown', tools:'Claude, Markdown', ai:true},
    {name:'Identify tasks', method:'Work decomposition', tools:'Jira, Claude', ai:true},
    {name:'Mark parallel opportunities', method:'Dependency mapping', tools:'Miro, draw.io', ai:true},
    {name:'Review with dev team', method:'Team walkthrough', tools:'Video call, Jira', ai:false},
  ],
  template:
    '# Task Breakdown: [Feature Name]\n\n**Feature:** [link]\n**Sprint:** [N]\n**Total tasks:** [N] | **Parallel [P]:** [N]\n\n## Summary\n\n## Tasks\n\n| ID | Task | Story | AC | Est. | [P] | Affected Files | Status |\n|---|---|---|---|---|---|---|---|\n| T-01 | | US-001 | AC-001 | 4h | | | Todo |\n| T-02 | | US-001 | AC-002 | 3h | ✓ | | Todo |\n\n## Task Details\n\n### T-01: [Task name]\n**Story:** US-XXX-NNN\n**AC:** AC-NNN\n**Estimate:** Xh\n**Parallel:** No / [P]\n**Affected files:**\n- `src/...`\n\n**Steps:**\n1.\n2.\n\n**Done when:** [observable outcome]\n\n---\n\n## Traceability Matrix\n| Story | AC | Task | Test |\n|---|---|---|---|\n| US-001 | AC-001 | T-01 | TC-01 |\n\n## Risk Assessment\n| Task | Risk | Mitigation |\n|---|---|---|\n',
  aiTasks: [
    {
      name: 'Task Decomposer',
      persona: 'Senior Developer',
      objective: 'Break the feature into discrete tasks ≤8h with parallelism markers.',
      prompt: 'You are a Senior Developer. Decompose this feature into implementation tasks: (1) Each task ≤8h — split larger ones, (2) Mark tasks that can run in parallel as [P], (3) For each task: affected files, linked story/AC, clear done-when criterion, (4) Sequence dependent tasks explicitly. Output as a task table + parallelism summary.',
    },
    {
      name: 'Traceability Validator',
      persona: 'QA Engineer',
      objective: 'Verify every AC and story has at least one implementing task and one test.',
      prompt: 'You are a QA Engineer. Review this task breakdown against the stories and ACs: (1) ACs with no implementing task? (2) Tasks with no linked AC (orphaned work)? (3) ACs with no test case? Output a traceability matrix and flag gaps as HIGH/MEDIUM/LOW.',
    },
  ],
});
write('docs-delivery.json', delivery);
console.log('delivery done');

// ═══════════════════════════════════════════════════════════════════════════
// docs-governance.json — adr upgrade + clarification-log + consistency-analysis
// ═══════════════════════════════════════════════════════════════════════════
const governance = read('docs-governance.json');

// ADR: add Patterns Established + staleness warning
const adr = find(governance, 'adr');
if (!adr.template.includes('Patterns Established')) {
  adr.template = adr.template.replace(
    '## Related ADRs\n',
    '## Patterns Established\n> Reusable patterns or conventions that emerge from this decision.\n\n## Staleness Warning\n**Review date:** [date + 12 months]\nIf the context described here has changed significantly, mark status "Stale" and open a new ADR.\n\n## Related ADRs\n'
  );
}

// Add clarification-log
upsert(governance, {
  phase: 'governance', key: 'clarification-log',
  title: 'Clarification Log', sub: 'Structured ambiguity resolution log',
  path: '[project]/04_governance/clarification-log.md',
  owner: 'Business Analyst',
  reviewers: ['Product Owner', 'Tech Lead'],
  signoff: '',
  lifecycle: 'Living — updated throughout the project whenever ambiguity is found',
  trigger: 'Ambiguity or conflicting interpretation discovered in any document or meeting',
  doel: 'Prevent the same ambiguity from re-surfacing by recording every resolution with full context.',
  inputs: ['Ambiguous requirement or spec', 'Stakeholder conversation or review comment'],
  outputs: ['Resolved interpretation with rationale', 'Input for spec/feature updates', 'Audit trail of decisions'],
  flow: [
    {name:'Ambiguity Found', sub:'In any doc or meeting', type:'trigger'},
    {name:'Log Entry Created', sub:'BA captures question + options', type:'step'},
    {name:'Resolution', sub:'PO or stakeholder decides', type:'step'},
    {name:'Propagated', sub:'Relevant docs updated', type:'output'},
  ],
  note: 'Unresolved entries older than 5 business days should be escalated. Every entry must include options — stakeholders choose, they do not invent answers from scratch.',
  refs: [{dir:'→',key:'feature'},{dir:'→',key:'story'}],
  creation: [
    {name:'Capture question and context', method:'Structured logging', tools:'Markdown, Claude', ai:false},
    {name:'Generate options with trade-offs', method:'Option analysis', tools:'Claude', ai:true},
    {name:'Get resolution', method:'Meeting or async', tools:'Slack, email, Confluence', ai:false},
    {name:'Update linked documents', method:'Document update', tools:'Markdown, GitHub PR', ai:false},
  ],
  template:
    '# Clarification Log\n\nProject: [name]\nLast updated: [date]\n\n## Open\n\n### CLR-001: [Short description]\n**Date opened:** [date]\n**Raised by:**\n**Context:** [Which document / story / meeting triggered this]\n**Question:**\n\n**Options:**\n- **A:** [description] — Trade-off: ...\n- **B:** [description] — Trade-off: ...\n\n**Resolution:** Pending\n**Owner:**\n**Escalate if unresolved after:** [date + 5 business days]\n\n---\n\n## Resolved\n\n### CLR-000: [Short description]\n**Date opened:** [date] | **Resolved:** [date]\n**Question:**\n**Resolution:** Option [A/B/other]\n**Rationale:**\n**Impact:** [Which docs were updated]\n',
  aiTasks: [
    {
      name: 'Clarification Generator',
      persona: 'Business Analyst',
      objective: 'Surface ambiguities in a document and generate structured options for resolution.',
      prompt: 'You are a Business Analyst. Review this document for ambiguities: (1) Terms with multiple valid interpretations, (2) Business rules that conflict or overlap, (3) Scenarios not covered by ACs, (4) Assumptions stated as facts. For each: write the clarification question, 2-3 concrete options with trade-offs pre-filled so the stakeholder only needs to choose. Format as CLR-NNN entries.',
    },
    {
      name: 'Resolution Impact Assessor',
      persona: 'Business Analyst',
      objective: 'Identify which documents need updating after a clarification is resolved.',
      prompt: 'You are a BA. A clarification has been resolved. Identify: (1) Which documents reference the ambiguous term or rule? (2) What specific section in each needs updating? (3) Does this resolution create a new ambiguity elsewhere? Output a change propagation list: Document | Section | Change needed.',
    },
  ],
});

// Add consistency-analysis
upsert(governance, {
  phase: 'governance', key: 'consistency-analysis',
  title: 'Consistency Analysis', sub: 'Cross-artifact validation gate before implementation',
  path: '[project]/04_governance/consistency-analysis-[feature].md',
  owner: 'Business Analyst',
  reviewers: ['Tech Lead', 'QA Engineer'],
  signoff: 'Tech Lead',
  lifecycle: 'Per feature — run before implementation starts',
  trigger: 'All pre-implementation artifacts complete (feature, stories, ACs, task breakdown)',
  doel: 'Verify all artifacts are aligned before coding starts — a gap found here costs minutes, the same gap found in testing costs days.',
  inputs: ['Feature doc', 'User stories', 'Acceptance criteria', 'Task breakdown', 'NFR (if applicable)'],
  outputs: ['PASS / PASS WITH WARNINGS / FAIL verdict', 'Gap list with severity', 'Gate sign-off'],
  flow: [
    {name:'Artifacts Complete', sub:'All four docs present', type:'trigger'},
    {name:'Consistency Review', sub:'BA + TL run analysis', type:'step'},
    {name:'Gap Resolution', sub:'Update docs or accept risk', type:'step'},
    {name:'Gate Sign-off', sub:'TL approves PASS verdict', type:'signoff'},
    {name:'Implementation Green-lit', sub:'Sprint work begins', type:'output'},
  ],
  note: 'FAIL blocks implementation. PASS WITH WARNINGS requires documented acceptance of each warning. Do not skip this gate to meet velocity targets — the debt is always larger than the saving.',
  refs: [{dir:'←',key:'feature'},{dir:'←',key:'ac'},{dir:'←',key:'task-breakdown'}],
  creation: [
    {name:'Collect all artifacts', method:'Document assembly', tools:'Confluence, GitHub', ai:false},
    {name:'Run consistency check', method:'Cross-reference analysis', tools:'Claude', ai:true},
    {name:'Document gaps', method:'Structured gap logging', tools:'Markdown, Claude', ai:true},
    {name:'Get gate sign-off', method:'Review meeting', tools:'Confluence, Zoom', ai:false},
  ],
  template:
    '# Consistency Analysis: [Feature Name]\n\n**Date:** [date]\n**Verdict:** PASS / PASS WITH WARNINGS / FAIL\n**Signed off by:**\n\n## Artifacts in Scope\n| Artifact | Link | Present |\n|---|---|---|\n| Feature doc | | ✓ / ✗ |\n| User stories | | ✓ / ✗ |\n| Acceptance criteria | | ✓ / ✗ |\n| Task breakdown | | ✓ / ✗ |\n| NFR | | ✓ / ✗ |\n\n## Checks\n\n### 1. Requirements Coverage\n- [ ] Every story maps to at least one feature section\n- [ ] Every business rule has at least one AC\n- [ ] No orphaned ACs (without a linked story)\n\n### 2. Testability\n- [ ] All ACs are binary (pass/fail, no subjective judgment)\n- [ ] State changes are observable and queryable\n- [ ] Performance thresholds are numeric with percentile specs\n\n### 3. Traceability\n- [ ] Every AC has at least one implementing task\n- [ ] Every task has a done-when criterion\n- [ ] No orphaned tasks (not linked to any AC)\n\n### 4. Technical Completeness\n- [ ] No task exceeds 8h\n- [ ] Parallel tasks identified [P]\n- [ ] Security and auth covered in tasks\n- [ ] Error scenarios covered in ACs\n\n## Gaps\n| ID | Type | Severity | Description | Resolution |\n|---|---|---|---|---|\n| G-01 | | HIGH / MED / LOW | | |\n\n## Verdict Rationale\n\n## Accepted Warnings (PASS WITH WARNINGS only)\n| Warning ID | Description | Accepted by | Reason |\n|---|---|---|---|\n',
  aiTasks: [
    {
      name: 'Consistency Analyzer',
      persona: 'QA Engineer',
      objective: 'Map requirements → plan → tasks → tests and flag all gaps.',
      prompt: 'You are a QA Engineer specialising in requirements consistency. Given these artifacts (feature, stories, ACs, task breakdown), perform a full consistency analysis: (1) Requirements coverage — every story maps to feature sections, every business rule has an AC; (2) Testability — ACs are binary, state changes observable, thresholds numeric; (3) Traceability — every AC has an implementing task, every task has a done-when; (4) Technical completeness — security, error handling, edge cases covered. Output: PASS / PASS WITH WARNINGS / FAIL with a gap table (ID | type | severity | description | recommendation).',
    },
    {
      name: 'Pre-Implementation Gate Checker',
      persona: 'Tech Lead',
      objective: 'Verify the team is truly ready to start implementation.',
      prompt: 'You are a Tech Lead running the pre-implementation gate. Check: (1) All clarifications in the log resolved? (2) Environment and dependencies ready? (3) Parallel task sequence agreed? (4) All team members know their first task? (5) Any spike still outstanding? Output a gate checklist PASS/FAIL per item and a final go/no-go recommendation.',
    },
  ],
});

write('docs-governance.json', governance);
console.log('governance done');
console.log('\nAll files updated. Validate JSON:');
console.log('  python3 -c "import json,os; [json.load(open(\'data/\'+f)) for f in os.listdir(\'data\') if f.endswith(\'.json\')]; print(\'all valid\')"');
