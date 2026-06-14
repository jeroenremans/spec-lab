// Add multi-perspective AI tasks to discovery phase
// node _update-multi-agent.js
const fs = require('fs');
const base = __dirname + '/data/';
const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));
const find  = (arr, key) => arr.find(d => d.key === key);

function addAiTask(arr, docKey, task) {
  const doc = find(arr, docKey);
  if (!doc) return console.error('not found:', docKey);
  if (!doc.aiTasks.find(t => t.name === task.name)) doc.aiTasks.push(task);
}

const discovery = read('docs-discovery.json');

// ─── persona: Stakeholder Perspective Panel ───────────────────────────────────
// 3 perspectives (end-user, manager, developer) + consensus
addAiTask(discovery, 'persona', {
  name: 'Stakeholder Perspective Panel',
  persona: 'Multi-Agent Facilitator',
  step: 'PO Review',
  objective: 'Validate this persona from 3 stakeholder viewpoints and synthesise consensus.',
  prompt: `You are facilitating a multi-perspective panel review of this persona document. Simulate three distinct reviewers in sequence — each reads the full persona and responds independently.

**Reviewer 1 — End User Representative**
Does this persona feel real? What rings true? What feels assumed or missing from lived experience? Are the goals and frustrations genuine?

**Reviewer 2 — Product Owner**
Does this persona give clear enough direction for prioritisation? Which of their needs are already addressed? Which create scope risk? Is this persona distinct enough from others to be useful?

**Reviewer 3 — Developer / Tech Lead**
Are the technical expectations realistic? Does anything in this persona imply constraints we haven't planned for (performance, accessibility, device, data)?

---
**Common Ground & Synthesis**
1. What do all three reviewers agree on?
2. Where do perspectives conflict — and why?
3. What one change to the persona would address the most cross-cutting concern?
4. Is this persona strong enough to drive feature decisions? Verdict: Ready / Needs Work / Rethink.`,
});

// ─── as-is: Multi-Role Process Reviewer ──────────────────────────────────────
// Operations, management, end-user — find friction consensus
addAiTask(discovery, 'as-is', {
  name: 'Multi-Role Process Reviewer',
  persona: 'Multi-Agent Facilitator',
  step: 'Validation',
  objective: 'Review this as-is process from 3 organisational roles and identify shared friction points.',
  prompt: `You are facilitating a multi-role review of this as-is process document. Three reviewers each read the process and react independently.

**Reviewer 1 — Operations / Floor Worker (does the process daily)**
Where does this process slow you down? Where do you work around the official steps? What's the most frustrating moment? What would you fix first if you could?

**Reviewer 2 — Manager / Team Lead (responsible for outcomes)**
Where does this process create reporting blind spots or escalation delays? Where are handoffs breaking down? What metrics does this process make hard to track?

**Reviewer 3 — IT / Systems Owner (supports the tooling)**
Where does the process depend on manual workarounds for missing system support? Where do data quality issues originate? Where is automation feasible but not implemented?

---
**Common Ground & Synthesis**
1. Which friction points appear in 2 or 3 perspectives? These are your highest-confidence pain points.
2. Which pain points are perspective-specific (valid but not shared)?
3. Rank the top 3 cross-cutting improvement opportunities.
4. Are there any contradictions between perspectives that need a decision before proceeding?`,
});

// ─── pijnpunten: Cross-Persona Pain Validator ────────────────────────────────
// Validate pain points against multiple user personas
addAiTask(discovery, 'pijnpunten', {
  name: 'Cross-Persona Pain Validator',
  persona: 'Multi-Agent Facilitator',
  step: 'Prioritisation',
  objective: 'Validate each pain point from the perspective of 3 user personas and find common ground.',
  prompt: `You are running a cross-persona validation of this pain points document. Three distinct user personas each review the pain points and respond.

**Persona A — Power User (experienced, high-frequency user)**
Which pain points match your daily reality? Which feel minor to you — you've found workarounds? Which are dealbreakers that make you avoid the system?

**Persona B — Occasional User (low frequency, low confidence)**
Which pain points block you from even starting? Which pain points do you not even recognise — suggesting the problem is invisible to you because you avoid that part entirely?

**Persona C — Manager / Decision Maker (uses outputs, not the system directly)**
Which pain points create downstream problems you see in reports, delays, or escalations? Which would you not even notice because they're invisible at your level?

---
**Common Ground & Synthesis**
1. Which pain points are felt across ALL three personas? Mark these HIGH PRIORITY.
2. Which are felt by exactly two personas? MEDIUM PRIORITY.
3. Which are persona-specific? Flag these — fixing them may not justify the cost if the persona is small.
4. Are there pain points missing from this document that multiple personas would raise?
5. Revised priority ranking with justification.`,
});

// ─── spike: Multi-Perspective Decision Council ────────────────────────────────
// Tech, business, UX validate the spike decision
addAiTask(discovery, 'spike', {
  name: 'Multi-Perspective Decision Council',
  persona: 'Multi-Agent Facilitator',
  step: 'Decision',
  objective: 'Challenge the spike decision from tech, business, and UX perspectives before committing.',
  prompt: `You are running a pre-commitment review of this spike's findings and proposed decision. Three council members challenge the recommendation independently.

**Council Member 1 — Tech Lead (implementation risk)**
Is the chosen option technically sound? What hidden complexity does the spike NOT address yet? What would make you confident vs. worried about committing to this approach? What's the most likely technical failure mode?

**Council Member 2 — Product Owner (business risk)**
Does the chosen option serve the original user problem — or did we optimise for technical elegance? Does the timebox justify the confidence level? What's the cost of being wrong? Is there a faster path to the same outcome?

**Council Member 3 — UX / BA (user & requirements risk)**
Does the chosen option preserve all user-facing behaviours we need? Are there edge cases in the user journeys that this approach makes harder to handle? Did the spike test the right scenarios?

---
**Common Ground & Synthesis**
1. Where do all three agree the decision is sound?
2. Where do concerns overlap across 2+ perspectives? These are your blocking risks — resolve before committing.
3. What one additional validation would give the most confidence across all perspectives?
4. Final gate: Proceed / Proceed with conditions / Re-spike.`,
});

write('docs-discovery.json', discovery);
console.log('discovery done —', find(discovery,'persona').aiTasks.map(t=>t.name));

// ─── Also add to prd (intake) — multi-stakeholder requirements review ─────────
const intake = read('docs-intake.json');
addAiTask(intake, 'prd', {
  name: 'Multi-Stakeholder Requirements Review',
  persona: 'Multi-Agent Facilitator',
  step: 'Review',
  objective: 'Review PRD requirements from business, user, and technical perspectives to find conflicts and gaps.',
  prompt: `You are running a multi-stakeholder review of this PRD. Three reviewers read it independently and respond.

**Reviewer 1 — Business Sponsor / Executive**
Do the stated goals map to measurable business outcomes? Is the scope proportional to the business value? What success looks like in 6 months? What's missing that a board would ask about?

**Reviewer 2 — End User Representative**
Does this PRD describe something you'd actually want to use? Which goals feel abstract rather than practical? What daily workflow does this improve — and is that clearly stated? What's described that you didn't ask for?

**Reviewer 3 — Solution Architect / Tech Lead**
Are the scope boundaries realistic? Are there requirements that will drive disproportionate technical complexity? Are NFRs (performance, security, scale) implicit but unstated? What's underspecified?

---
**Common Ground & Synthesis**
1. Which requirements all three reviewers support? These are your stable core.
2. Which requirements only one reviewer cares about? Flag for priority discussion.
3. Where do reviewers conflict? List the tension and recommend a resolution.
4. What's missing from the PRD that 2+ perspectives need?
5. Overall verdict: Proceed to discovery / Clarify first / Rethink scope.`,
});
write('docs-intake.json', intake);
console.log('intake done');
