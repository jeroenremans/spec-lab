// Add `step` field to every aiTask — matches a flow step name to show in-flow connection
// Run: node _update-aitask-steps.js
const fs = require('fs');
const base = __dirname + '/data/';
const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));
const find  = (arr, key) => arr.find(d => d.key === key);

// step(docArr, docKey, taskName, flowStepName)
function mapTask(arr, docKey, taskName, flowStep) {
  const doc = find(arr, docKey);
  if (!doc) return console.error('doc not found:', docKey);
  const task = doc.aiTasks.find(t => t.name === taskName);
  if (!task) return console.error('task not found:', taskName, 'in', docKey);
  task.step = flowStep;
}

// ─── docs-intake.json ────────────────────────────────────────────────────────
const intake = read('docs-intake.json');
mapTask(intake, 'org-constitution',    'Standards Completeness Checker', 'Draft Update');
mapTask(intake, 'org-constitution',    'Security Baseline Reviewer',     'Review Board');
mapTask(intake, 'project-constitution','Stack Validator',                'Draft');
mapTask(intake, 'project-constitution','Org Alignment Checker',          'Org Alignment');
mapTask(intake, 'prd',                 'Scope Validator',                'Draft PRD');
mapTask(intake, 'prd',                 'Stakeholder Impact Analyst',     'Review');
mapTask(intake, 'stakeholders',        'Interview Planner',              'Interviews');
mapTask(intake, 'stakeholders',        'RACI Generator',                 'Document');
write('docs-intake.json', intake);
console.log('intake done');

// ─── docs-discovery.json ─────────────────────────────────────────────────────
const discovery = read('docs-discovery.json');
mapTask(discovery, 'as-is',      'Process Gap Analyst',    'Modelling');
mapTask(discovery, 'as-is',      'Quick Win Identifier',   'Modelling');
mapTask(discovery, 'pijnpunten', 'Root Cause Analyst',     'Analysis');
mapTask(discovery, 'pijnpunten', 'Priority Matrix Advisor','Prioritisation');
mapTask(discovery, 'persona',    'Interview Guide Creator','Interviews');
mapTask(discovery, 'persona',    'Journey Mapper',         'Synthesis');
mapTask(discovery, 'spike',      'Spike Planner',          'Define Exploration');
mapTask(discovery, 'spike',      'Findings Synthesiser',   'Decision');
write('docs-discovery.json', discovery);
console.log('discovery done');

// ─── docs-solution.json ──────────────────────────────────────────────────────
const solution = read('docs-solution.json');
mapTask(solution, 'epic',    'Business Value Validator', 'Draft Epic');
mapTask(solution, 'epic',    'Feature Decomposer',       'Draft Epic');
mapTask(solution, 'epic',    'Spike Planner',            'Draft Epic');
mapTask(solution, 'feature', 'Business Rules Extractor', 'Feature Draft');
mapTask(solution, 'feature', 'Complexity Estimator',     'Tech Review');
mapTask(solution, 'feature', 'Clarification Generator',  'Feature Draft');
mapTask(solution, 'story',   'INVEST Validator',         'Story Draft');
mapTask(solution, 'story',   'Story Splitter',           'Story Draft');
mapTask(solution, 'story',   'Clarification Generator',  'Story Draft');
mapTask(solution, 'ac',      'AC Generator',             'Write ACs');
mapTask(solution, 'ac',      'Edge Case Detective',      'Edge Case Review');
write('docs-solution.json', solution);
console.log('solution done');

// ─── docs-delivery.json ──────────────────────────────────────────────────────
const delivery = read('docs-delivery.json');
mapTask(delivery, 'dod',            'DoD Reviewer',              'Workshop');
mapTask(delivery, 'sprint',         'Risk Flagger',              'Backlog Review');
mapTask(delivery, 'release',        'Stakeholder Summary Writer','Changelog');
mapTask(delivery, 'test-plan',      'Test Case Generator',       'Write Test Plan');
mapTask(delivery, 'test-plan',      'Risk-Based Scope Advisor',  'Write Test Plan');
mapTask(delivery, 'task-breakdown', 'Task Decomposer',           'Task Design');
mapTask(delivery, 'task-breakdown', 'Traceability Validator',    'Team Review');
write('docs-delivery.json', delivery);
console.log('delivery done');

// ─── docs-governance.json ────────────────────────────────────────────────────
const governance = read('docs-governance.json');
mapTask(governance, 'adr',                 'Alternative Generator',           'Draft ADR');
mapTask(governance, 'adr',                 'Risk Evaluator',                  'Draft ADR');
mapTask(governance, 'risk',                'Risk Scorer',                     'Add to Register');
mapTask(governance, 'glossary',            'Term Extractor',                  'Define');
mapTask(governance, 'clarification-log',   'Clarification Generator',         'Log Entry Created');
mapTask(governance, 'clarification-log',   'Resolution Impact Assessor',      'Resolution');
mapTask(governance, 'consistency-analysis','Consistency Analyzer',            'Consistency Review');
mapTask(governance, 'consistency-analysis','Pre-Implementation Gate Checker', 'Gate Sign-off');
write('docs-governance.json', governance);
console.log('governance done');

// ─── docs-architecture.json ──────────────────────────────────────────────────
const arch = read('docs-architecture.json');
mapTask(arch, 'api',         'Contract Completeness Reviewer','API Design');
mapTask(arch, 'api',         'Security Auditor',              'Consumer Review');
mapTask(arch, 'domain',      'DDD Entity Validator',          'Model Design');
mapTask(arch, 'domain',      'Database Schema Advisor',       'Model Design');
mapTask(arch, 'integration', 'Error Handling Advisor',        'Write Integration Doc');
mapTask(arch, 'nfr',         'Metric Definer',                'Define NFRs');
mapTask(arch, 'nfr',         'Test Strategy Advisor',         'Define NFRs');
write('docs-architecture.json', arch);
console.log('architecture done');
