// Add Mermaid Diagram Generator AI tasks to relevant docs
// node _update-mermaid.js
const fs = require('fs');
const base = __dirname + '/data/';
const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));

function addAiTask(arr, docKey, task) {
  const doc = arr.find(d => d.key === docKey);
  if (!doc) return console.error('not found:', docKey);
  if (!doc.aiTasks.find(t => t.name === task.name)) doc.aiTasks.push(task);
}

const ASSESS_PREFIX = `Assess first: only generate a diagram if this document has structural complexity that text alone would obscure — multiple decision points, 4+ interacting actors, entity relationships, or parallel paths. If the content is simple or linear, reply: **"No diagram needed — the text is sufficient."**\n\nIf a diagram IS warranted, generate valid Mermaid syntax.\n\n`;

// ─── docs-discovery.json ─────────────────────────────────────────────────────
const discovery = read('docs-discovery.json');

addAiTask(discovery, 'as-is', {
  name: 'Process Flow Diagram',
  persona: 'Business Analyst',
  step: 'Modelling',
  objective: 'Generate a flowchart of the as-is process only if it has branching or parallel paths that text cannot convey clearly.',
  prompt: ASSESS_PREFIX + `You are a BA modelling an as-is process.

Assessment: Does this process have decision points, parallel lanes, or handoffs between 3+ actors? If yes, a flowchart is warranted. If it is a simple linear sequence, it is not.

If warranted, generate a \`flowchart LR\` with:
- Swimlanes per actor (using \`subgraph\`)
- Decision nodes (diamond shape with \`{}\`)
- Handoff points clearly marked
- No more than 12 nodes — simplify if needed

Output only the mermaid code block, no explanation.`,
});

addAiTask(discovery, 'persona', {
  name: 'User Journey Diagram',
  persona: 'UX Researcher',
  step: 'Synthesis',
  objective: 'Generate a user journey map for this persona only if their path has multiple stages with distinct emotional shifts.',
  prompt: ASSESS_PREFIX + `You are a UX Researcher mapping a user journey.

Assessment: Does this persona have 4+ distinct journey stages with varying sentiment? If the persona description only covers demographics and goals without a journey, a diagram adds no value.

If warranted, generate a \`journey\` diagram with:
- Section per journey stage
- Tasks per stage (score 1–5 for satisfaction)
- Actor: the persona name

Output only the mermaid code block, no explanation.`,
});

addAiTask(discovery, 'pijnpunten', {
  name: 'Priority Matrix Diagram',
  persona: 'Product Owner',
  step: 'Prioritisation',
  objective: 'Generate an impact vs effort quadrant for prioritised pain points only if there are 4+ items to compare.',
  prompt: ASSESS_PREFIX + `You are a PO creating a prioritisation matrix.

Assessment: Are there 4 or more distinct pain points with differing impact/effort profiles? If fewer, a simple ranked list in text is clearer.

If warranted, generate a \`quadrantChart\` with:
- X axis: Effort (Low → High)
- Y axis: Impact (Low → High)
- Each pain point plotted as a point with a short label
- Keep labels under 20 characters

Output only the mermaid code block, no explanation.`,
});

addAiTask(discovery, 'spike', {
  name: 'Options Comparison Diagram',
  persona: 'Solution Architect',
  step: 'Parallel Exploration',
  objective: 'Visualise the spike options side-by-side only if comparing 3+ attributes across 2+ options would be clearer visually.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect comparing spike options.

Assessment: Are there 2+ options with 3+ comparable dimensions (effort, risk, scalability, etc.)? If it is a binary choice with one clear winner, text is sufficient.

If warranted, generate a \`flowchart TD\` showing:
- Each option as a branch from the decision node
- Key properties listed under each option node
- A "Decision" node at the bottom with the chosen path highlighted using a style

Output only the mermaid code block, no explanation.`,
});

write('docs-discovery.json', discovery);
console.log('discovery done');

// ─── docs-solution.json ──────────────────────────────────────────────────────
const solution = read('docs-solution.json');

addAiTask(solution, 'epic', {
  name: 'Epic Scope Diagram',
  persona: 'Solution Architect',
  step: 'Draft Epic',
  objective: 'Generate a mindmap of epic scope only if the epic spans 4+ features or has a non-obvious decomposition.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect decomposing an epic.

Assessment: Does this epic contain 4 or more distinct features or capability areas? Is the decomposition non-obvious (i.e., not just a simple list)? If the scope is simple, a diagram adds no clarity.

If warranted, generate a \`mindmap\` with:
- Root: epic name
- Level 1: capability areas or themes
- Level 2: features or deliverables under each area
- Max 3 levels deep

Output only the mermaid code block, no explanation.`,
});

addAiTask(solution, 'feature', {
  name: 'Feature State Diagram',
  persona: 'Solution Architect',
  step: 'Feature Draft',
  objective: 'Generate a state or flow diagram for this feature only if it involves a lifecycle with multiple states or a non-trivial decision flow.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect analysing a feature.

Assessment: Does this feature involve an entity with 4+ lifecycle states, or a user flow with branching decisions? Simple CRUD features or single-path flows do not warrant a diagram.

If warranted, choose the correct type:
- Use \`stateDiagram-v2\` if the feature has an entity with a meaningful lifecycle (draft → review → approved → archived, etc.)
- Use \`flowchart TD\` if it is a decision-heavy process (multiple conditions determining next steps)

Include: all states/steps, transitions with labels, and error/exception paths.

Output only the mermaid code block, no explanation.`,
});

addAiTask(solution, 'story', {
  name: 'Story Flow Diagram',
  persona: 'Business Analyst',
  step: 'AC Written',
  objective: 'Generate a flow diagram only if this story involves a multi-step interaction or conditional logic that prose cannot make unambiguous.',
  prompt: ASSESS_PREFIX + `You are a BA reviewing a user story.

Assessment: Does this story involve 3+ sequential steps with conditional branches, or interactions between 2+ systems? Single-action stories ("as a user I want to see X") never need a diagram.

If warranted, generate a \`sequenceDiagram\` or \`flowchart TD\`:
- Use \`sequenceDiagram\` if there is an interaction between user + frontend + backend + database
- Use \`flowchart TD\` if it is purely a decision flow within one system

Keep to the happy path + one exception path maximum.

Output only the mermaid code block, no explanation.`,
});

write('docs-solution.json', solution);
console.log('solution done');

// ─── docs-governance.json ────────────────────────────────────────────────────
const governance = read('docs-governance.json');

addAiTask(governance, 'adr', {
  name: 'Decision Tree Diagram',
  persona: 'Solution Architect',
  step: 'Draft ADR',
  objective: 'Generate a decision tree only if the ADR evaluated 3+ options with non-obvious trade-offs.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect documenting an architectural decision.

Assessment: Did this decision involve comparing 3+ genuine alternatives? If it was a straightforward binary choice or the only viable option, a diagram adds no value.

If warranted, generate a \`flowchart TD\` showing:
- Decision context at the top
- Each option as a branch
- Key trade-off labels on branches
- Rejected options with a reason label
- Chosen option highlighted (\`style chosen fill:#d4edda\`)

Output only the mermaid code block, no explanation.`,
});

addAiTask(governance, 'consistency-analysis', {
  name: 'Artifact Traceability Diagram',
  persona: 'QA Engineer',
  step: 'Consistency Review',
  objective: 'Map the traceability chain from story to AC to task to test only if gaps exist that are hard to see in a table.',
  prompt: ASSESS_PREFIX + `You are a QA Engineer mapping artifact traceability.

Assessment: Are there more than 6 stories/ACs/tasks in scope? Is there a non-trivial mapping (one AC maps to 3 tasks, one task maps to 2 ACs)? If the mapping is 1:1:1 throughout, the table in the template is sufficient.

If warranted, generate a \`flowchart LR\` showing:
- Story nodes → AC nodes → Task nodes → Test nodes
- Links between them
- Orphaned nodes (no link) styled in red: \`style X fill:#f8d7da\`

Output only the mermaid code block, no explanation.`,
});

write('docs-governance.json', governance);
console.log('governance done');

// ─── docs-architecture.json ──────────────────────────────────────────────────
const arch = read('docs-architecture.json');

addAiTask(arch, 'api', {
  name: 'API Sequence Diagram',
  persona: 'Solution Architect',
  step: 'API Design',
  objective: 'Generate a sequence diagram for this API only if it involves 3+ actors or non-trivial async/error flows.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect designing an API contract.

Assessment: Does this API involve 3+ actors (client, API gateway, service, database, external system)? Are there async callbacks, webhooks, or complex error retry flows? A simple sync request/response to one endpoint does not warrant a diagram.

If warranted, generate a \`sequenceDiagram\` showing:
- All actors
- Happy path request/response
- At least one error path (4xx/5xx) with \`opt\` or \`alt\` block
- Auth token validation as a separate step if applicable

Output only the mermaid code block, no explanation.`,
});

addAiTask(arch, 'domain', {
  name: 'Domain Model Diagram',
  persona: 'Solution Architect',
  step: 'Model Design',
  objective: 'Generate an ER diagram only if this domain model has 4+ entities with non-obvious relationships.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect modelling a domain.

Assessment: Are there 4 or more entities with relationships that are not self-evident (many-to-many, optional vs required, inheritance)? A single entity or two entities with a simple 1:N relationship does not need a diagram.

If warranted, generate an \`erDiagram\` with:
- All entities and their key attributes (max 5 attributes per entity)
- Relationship cardinality labels (||, |o, }|, }o)
- Relationship action verbs ("CUSTOMER ||--o{ ORDER : places")

Output only the mermaid code block, no explanation.`,
});

addAiTask(arch, 'integration', {
  name: 'Integration Flow Diagram',
  persona: 'Solution Architect',
  step: 'Write Integration Doc',
  objective: 'Generate a sequence or flow diagram only if the integration involves 3+ systems or has retry/fallback logic.',
  prompt: ASSESS_PREFIX + `You are a Solution Architect documenting a system integration.

Assessment: Does this integration involve 3+ systems, or does it have retry logic, fallback paths, circuit breaking, or async processing? A simple point-to-point synchronous call does not need a diagram.

If warranted, generate a \`sequenceDiagram\` showing:
- All systems as actors
- Happy path data flow
- Error/retry/fallback paths using \`alt\` or \`opt\` blocks
- Async operations marked with \`->>+\` notation

Output only the mermaid code block, no explanation.`,
});

addAiTask(arch, 'nfr', {
  name: 'NFR Test Strategy Diagram',
  persona: 'QA Engineer',
  step: 'Define NFRs',
  objective: 'Generate a flowchart of the NFR test strategy only if it spans multiple test types and environments with non-obvious sequencing.',
  prompt: ASSESS_PREFIX + `You are a QA Engineer planning NFR testing.

Assessment: Does the test strategy span 3+ test types (load, stress, soak, spike, volume) across multiple environments? Is the sequencing non-obvious? A single load test does not need a diagram.

If warranted, generate a \`flowchart TD\` showing:
- Test phases in sequence
- Pass/fail gates between phases
- Which environment each phase runs in
- Escalation path if a gate fails

Output only the mermaid code block, no explanation.`,
});

write('docs-architecture.json', arch);
console.log('architecture done');
