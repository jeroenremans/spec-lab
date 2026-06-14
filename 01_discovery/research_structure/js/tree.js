// Tree view — document tree grouped by phase

function renderTree() {
  const grouped = {};
  Object.keys(phases).forEach(p => { grouped[p] = []; });
  documents.forEach(d => {
    if (!grouped[d.phase]) grouped[d.phase] = [];
    grouped[d.phase].push(d);
  });

  let html = `<div class="doc-list-header">
    <div class="doc-list-label">All Documents</div>
  </div><div class="tree-scroll">`;

  let first = true;
  Object.entries(grouped).forEach(([phaseKey, docs]) => {
    const ph = phases[phaseKey] || { label: phaseKey, color: '#888' };
    if (!docs.length) return;
    html += `<div class="tree-phase-hd${first?'':' tree-phase-hd--border'}">
      <span class="phase-dot" style="background:${x(ph.color)}"></span>
      <span>${x(ph.label)}</span>
      <span class="tree-count">${docs.length}</span>
    </div>`;
    first = false;
    docs.forEach(d => {
      const filename = d.path ? d.path.split('/').pop() : d.key+'.md';
      const isActive = d.key === activeKey;
      html += `<div class="tree-doc-item${isActive?' active':''}" onclick="treeSelectDoc('${d.key}')">
        <span class="tree-doc-icon">📄</span>
        <div class="tree-doc-info">
          <div class="tree-doc-title">${x(d.title)}</div>
          <div class="tree-doc-file">${x(filename)}</div>
        </div>
      </div>`;
    });
  });

  html += '</div>';
  document.getElementById('doc-list').innerHTML = html;
}

function treeSelectDoc(key) {
  activeKey = key;
  renderTree();
  showDoc(key);
}
