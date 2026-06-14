// Add short `perspectives` labels to multi-agent aiTasks
// node _update-perspectives.js
const fs = require('fs');
const base = __dirname + '/data/';
const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));

function set(arr, docKey, taskName, perspectives) {
  const doc = arr.find(d => d.key === docKey);
  const task = doc && doc.aiTasks.find(t => t.name === taskName);
  if (task) task.perspectives = perspectives;
  else console.error('not found:', docKey, taskName);
}

const discovery = read('docs-discovery.json');
set(discovery, 'persona',    'Stakeholder Perspective Panel',      ['End User', 'Product Owner', 'Developer / Tech Lead']);
set(discovery, 'as-is',      'Multi-Role Process Reviewer',        ['Operations', 'Manager / Team Lead', 'IT / Systems']);
set(discovery, 'pijnpunten', 'Cross-Persona Pain Validator',       ['Power User', 'Occasional User', 'Manager / Decision Maker']);
set(discovery, 'spike',      'Multi-Perspective Decision Council',  ['Tech Lead', 'Product Owner', 'UX / BA']);
write('docs-discovery.json', discovery);

const intake = read('docs-intake.json');
set(intake, 'prd', 'Multi-Stakeholder Requirements Review', ['Business Sponsor', 'End User', 'Solution Architect']);
write('docs-intake.json', intake);

console.log('done');
