// Migrate creation[] into flow[i].substeps[], remove creation[] from all docs
// node _migrate-to-substeps.js
const fs = require('fs');
const base = __dirname + '/data/';
const read  = f => JSON.parse(fs.readFileSync(base + f, 'utf8'));
const write = (f, d) => fs.writeFileSync(base + f, JSON.stringify(d, null, 2));

function distributeCreation(cArr, nSlots) {
  if (!nSlots) return [];
  const groups = Array.from({length: nSlots}, () => []);
  const base = Math.floor(cArr.length / nSlots);
  let ci = 0;
  for (let si = 0; si < nSlots; si++) {
    const take = si === nSlots - 1 ? cArr.length - ci : base;
    groups[si] = cArr.slice(ci, ci + take);
    ci += take;
  }
  return groups;
}

const files = [
  'docs-intake.json','docs-discovery.json','docs-solution.json',
  'docs-delivery.json','docs-governance.json','docs-architecture.json'
];

files.forEach(file => {
  const docs = read(file);
  docs.forEach(doc => {
    const creation = doc.creation || [];
    const flow = doc.flow || [];
    const stepNodes = flow.filter(s => s.type === 'step' || s.type === 'signoff');
    const groups = distributeCreation(creation, stepNodes.length);

    let gi = 0;
    flow.forEach(s => {
      if (s.type === 'step' || s.type === 'signoff') {
        s.substeps = (groups[gi++] || []).map(cs => ({
          name: cs.name, method: cs.method || '', tools: cs.tools || '', aiTask: ''
        }));
      }
      // triggers and outputs get no substeps (omit the field)
    });

    delete doc.creation;
    // Keep aiTasks[].step for backwards-compat fallback in view; will be replaced by substep.aiTask links
  });
  write(file, docs);
  console.log('migrated:', file);
});
