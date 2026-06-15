// Navigation: view modes, tabs, doc list, roles page, phase & doc modals

// ─── View mode switching ──────────────────────────────────────────────────────
function setViewMode(mode) {
  if (editMode && !confirm('Discard unsaved changes?')) return;
  viewMode = mode;
  editMode = false; editBuffer = null;
  renderPhaseTabs();
  if (mode === 'roles') {
    renderRolesPage();
  } else if (mode === 'tree') {
    renderTree();
    if (activeKey) showDoc(activeKey);
    else document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
  } else if (mode === 'schema') {
    renderSchemaView();
  } else {
    renderDocList();
    if (activeKey) showDoc(activeKey);
    else renderPhaseOverview();
  }
}

// ─── Roles page ───────────────────────────────────────────────────────────────
function renderRolesPage() {
  document.getElementById('doc-list').innerHTML = `
    <div style="padding:14px;border-bottom:1px solid var(--border)">
      <button class="btn btn-sm" onclick="setViewMode('docs')">← Documents</button>
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-faint);line-height:1.5">
      Roles used in document owner / reviewer / sign-off fields. Optionally assign a name.
    </div>`;

  const cards = roles.map((r,i) => `
    <div class="role-card">
      <div class="role-card-avatar">
        <input class="role-avatar-input" maxlength="4" placeholder="👤" value="${x(r.avatar||'')}"
          onchange="roles[${i}].avatar=this.value; saveRoles(); _refreshRoleAvatars();" title="Avatar emoji">
      </div>
      <div class="role-card-body">
        <div class="role-card-top">
          <input class="edit-input" placeholder="Role title" value="${x(r.title)}"
            onchange="roles[${i}].title=this.value; saveRoles();" style="flex:1">
          <input class="edit-input" placeholder="Person name (optional)" value="${x(r.name||'')}"
            onchange="roles[${i}].name=this.value; saveRoles();" style="flex:0 0 160px">
          <button class="btn btn-sm" onclick="deleteRole(${i})">✕</button>
        </div>
        <textarea class="edit-textarea" rows="2"
          placeholder="1–3 lines: who this role is and what they do in this project..."
          onchange="roles[${i}].description=this.value; saveRoles();">${x(r.description||'')}</textarea>
      </div>
    </div>`).join('');

  document.getElementById('detail').innerHTML = `
    <div style="max-width:760px">
      <div class="detail-hd">
        <div class="detail-hd-text">
          <div class="doc-title">Project Roles</div>
          <div class="doc-path">Define roles, assign people, and describe responsibilities</div>
        </div>
        <div class="detail-hd-actions">
          <button class="btn" onclick="addRole()">+ Add Role</button>
        </div>
      </div>
      <div id="roles-list">
        ${cards || '<div style="font-size:12px;color:var(--text-faint);padding:8px 0">No roles defined.</div>'}
      </div>
      <p style="font-size:12px;color:var(--text-faint);line-height:1.6;margin-top:8px">
        Changes are saved automatically. Roles appear in all owner, reviewer, and sign-off fields.
      </p>
    </div>`;

  window._refreshRoleAvatars = () => {};
}

function addRole() {
  roles.push({ key: 'role-'+Date.now(), title: '', name: '', avatar: '👤', description: '' });
  saveRoles();
  renderRolesPage();
}
function deleteRole(i) {
  const title = roles[i] && roles[i].title;
  if (title) {
    const usedIn = documents.filter(d =>
      d.owner === title ||
      d.signoff === title ||
      (d.reviewers || []).includes(title)
    );
    if (usedIn.length) {
      alert(`Role "${title}" is used in ${usedIn.length} document(s): ${usedIn.map(d=>d.title).join(', ')}.\nRemove the role from those documents first.`);
      return;
    }
  }
  roles.splice(i, 1);
  saveRoles();
  renderRolesPage();
}

// ─── Phase management modal ───────────────────────────────────────────────────
function openPhasesModal() {
  let buf = clone(phases);

  function render() {
    document.getElementById('modal-root').innerHTML = `
      <div class="modal-bg" onclick="if(event.target===this)closePhasesModal()">
        <div class="modal">
          <div class="modal-hd">
            <div class="modal-title">Edit Phases / Tabs</div>
            <button class="btn btn-sm" onclick="closePhasesModal()">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size:12px;color:var(--text-faint);margin-bottom:14px">
              Rename, recolour, or add phases. Phases with documents cannot be deleted.
            </p>
            ${Object.entries(buf).map(([k,v]) => {
              const count = documents.filter(d => d.phase === k).length;
              return `<div class="phase-edit-row">
                <div class="color-swatch" style="background:${x(v.color)}" title="Click to change colour">
                  <input type="color" value="${x(v.color)}" oninput="buf['${k}'].color=this.value;this.closest('.color-swatch').style.background=this.value">
                </div>
                <input class="edit-input" value="${x(v.label)}" onchange="buf['${k}'].label=this.value">
                <button class="btn btn-sm${count>0?' ':' btn-danger'}" onclick="phaseModalDelete('${k}',${count})" ${count>0?`disabled title="Has ${count} doc(s)"`:''}
                >✕</button>
              </div>`;
            }).join('')}
            <button class="btn btn-sm" style="margin-top:10px" onclick="phaseModalAdd()">+ Add Phase</button>
          </div>
          <div class="modal-foot">
            <button class="btn" onclick="closePhasesModal()">Cancel</button>
            <button class="btn btn-primary" onclick="savePhasesModal()">Save</button>
          </div>
        </div>
      </div>`;
    window._phaseBuf = buf;
  }

  window.phaseModalAdd = () => {
    buf['phase-'+Date.now()] = { label: 'New Phase', color: '#888888' };
    render();
  };
  window.phaseModalDelete = (k, count) => {
    if (count > 0) return;
    if (!confirm(`Delete phase "${buf[k].label}"?`)) return;
    delete buf[k]; render();
  };
  window.savePhasesModal = () => {
    phases = buf; savePhases();
    if (!phases[activePhase]) activePhase = Object.keys(phases)[0];
    closePhasesModal(); renderPhaseTabs(); renderDocList();
  };
  window.closePhasesModal = () => { document.getElementById('modal-root').innerHTML = ''; };
  render();
}

// ─── New document modal ───────────────────────────────────────────────────────
function openNewDocModal() {
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-bg" onclick="if(event.target===this)closeNewDocModal()">
      <div class="modal">
        <div class="modal-hd">
          <div class="modal-title">Add Document</div>
          <button class="btn btn-sm" onclick="closeNewDocModal()">✕</button>
        </div>
        <div class="modal-body">
          <div class="edit-field"><div class="edit-label">Title</div>
            <input class="edit-input" id="nd-title" placeholder="e.g. Test Plan" oninput="
              const k=document.getElementById('nd-key');
              if(!k._manual) k.value=uniqueDocKey(this.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))">
          </div>
          <div class="edit-field"><div class="edit-label">Subtitle</div>
            <input class="edit-input" id="nd-sub" placeholder="Short description">
          </div>
          <div class="edit-field"><div class="edit-label">Phase</div>
            <select class="edit-select" id="nd-phase">
              ${Object.entries(phases).map(([k,v])=>`<option value="${x(k)}"${k===activePhase?' selected':''}>${x(v.label)}</option>`).join('')}
            </select>
          </div>
          <div class="edit-field"><div class="edit-label">Parent Document (optional)</div>
            <select class="edit-select" id="nd-parent">
              <option value="">— No parent —</option>
              ${documents.map(doc=>`<option value="${x(doc.key)}">${x(doc.title)} (${x(doc.phase)})</option>`).join('')}
            </select>
          </div>
          <div class="edit-field"><div class="edit-label">Key (unique identifier)</div>
            <input class="edit-input" id="nd-key" placeholder="auto-generated" oninput="this._manual=true">
          </div>
          <div class="edit-field"><div class="edit-label">Path</div>
            <input class="edit-input" id="nd-path" placeholder="[project]/phase/document.md">
          </div>
        </div>
        <div class="modal-foot">
          <button class="btn" onclick="closeNewDocModal()">Cancel</button>
          <button class="btn btn-primary" onclick="createDoc()">Create</button>
        </div>
      </div>
    </div>`;
  window.closeNewDocModal = () => { document.getElementById('modal-root').innerHTML = ''; };
  window.createDoc = () => {
    const title  = document.getElementById('nd-title').value.trim();
    const sub    = document.getElementById('nd-sub').value.trim();
    const phase  = document.getElementById('nd-phase').value;
    const parent = document.getElementById('nd-parent').value;
    const key    = document.getElementById('nd-key').value.trim() || uniqueDocKey(title.toLowerCase().replace(/[^a-z0-9]+/g,'-'));
    const path   = document.getElementById('nd-path').value.trim();
    if (!title) { alert('Title is required'); return; }
    if (!key || documents.find(d => d.key === key)) { alert('Key is empty or already in use'); return; }
    const doc = { phase, key, title, sub, path, parent: parent||'', owner:'', reviewers:[], signoff:'', lifecycle:'', trigger:'', doel:'', inputs:[], outputs:[], flow:[], note:'', refs:[], template:'', aiTasks:[] };
    documents.push(doc); saveData();
    closeNewDocModal();
    activePhase = phase; activeKey = key;
    renderPhaseTabs(); renderDocList(); startEdit(key);
  };
}

function uniqueDocKey(base) {
  if (!base) base = 'doc';
  let key = base; let n = 2;
  while (documents.find(d => d.key === key)) { key = base+'-'+n; n++; }
  return key;
}

// ─── Delete document ──────────────────────────────────────────────────────────
function confirmDeleteDoc(key) {
  const d = documents.find(z => z.key === key);
  if (!d || !confirm(`Delete "${d.title}"? This cannot be undone.`)) return;
  documents = documents.filter(z => z.key !== key);
  saveData(); activeKey = null; editMode = false; editBuffer = null;
  renderDocList(); renderPhaseOverview();
}

// ─── Phase tabs & doc list ────────────────────────────────────────────────────
function renderPhaseTabs() {
  const tabs = Object.entries(phases).map(([k,v]) =>
    `<div class="phase-tab${viewMode==='docs'&&k===activePhase?' active':''}" onclick="setPhaseTab('${k}')">
      <span class="phase-dot" style="background:${x(v.color)}"></span>${x(v.label)}
    </div>`).join('');
  const treeTab   = `<div class="phase-tab tree-tab${viewMode==='tree'?' active':''}" onclick="setViewMode('tree')">🌲 Tree</div>`;
  const schemaTab = `<div class="phase-tab${viewMode==='schema'?' active':''}" onclick="setViewMode('schema')">⬛ Schema</div>`;
  const rolesTab  = `<div class="phase-tab roles-tab${viewMode==='roles'?' active':''}" onclick="setViewMode('roles')" style="margin-left:auto">👥 Roles</div>`;
  document.getElementById('phase-nav').innerHTML = tabs + treeTab + schemaTab + rolesTab;
}

function setPhaseTab(phase) {
  if (viewMode !== 'docs') {
    viewMode = 'docs';
    editMode = false; editBuffer = null;
  }
  setPhase(phase);
}

function _sortByHierarchy(docs) {
  const docKeys = new Set(docs.map(d => d.key));
  const byParent = {};
  docs.forEach(d => {
    const p = (d.parent && docKeys.has(d.parent)) ? d.parent : '';
    (byParent[p] = byParent[p] || []).push(d);
  });
  const result = [];
  function dfs(parentKey, depth) {
    (byParent[parentKey] || []).forEach(d => {
      result.push({d, depth});
      dfs(d.key, depth + 1);
    });
  }
  dfs('', 0);
  // orphans (parent in other phase) — append at depth 0
  const reached = new Set(result.map(r => r.d.key));
  docs.forEach(d => { if (!reached.has(d.key)) result.push({d, depth: 0}); });
  return result;
}

function _docItemHtml(d, depth) {
  return `<div class="doc-item${d.key===activeKey?' active':''}${depth>0?' doc-item--child':''}"
       style="${depth>0?`padding-left:${10+depth*14}px`:''}"
       onclick="showDoc('${d.key}')">
    ${depth>0?'<span class="doc-item-indent">└</span>':''}
    <div class="doc-item-text">
      <div class="doc-item-title">${x(d.title)}</div>
      <div class="doc-item-sub">${x(d.sub||'')}</div>
    </div>
  </div>`;
}

function renderDocList() {
  if (viewMode === 'roles' || viewMode === 'tree') return;
  const phaseDocs = documents.filter(d => d.phase === activePhase && !d.shared);
  const sharedDocs = documents.filter(d => d.shared);
  const phaseLabel = phases[activePhase] ? phases[activePhase].label : activePhase;
  const items = _sortByHierarchy(phaseDocs);

  const phaseHtml = items.length
    ? items.map(({d, depth}) => _docItemHtml(d, depth)).join('')
    : `<div style="padding:20px 14px;font-size:12px;color:var(--text-faint)">No documents in this phase.</div>`;

  const sharedHtml = sharedDocs.length
    ? `<div class="doc-list-divider">Shared templates</div>` +
      sharedDocs.map(d => _docItemHtml(d, 0)).join('')
    : '';

  document.getElementById('doc-list').innerHTML =
    `<div class="doc-list-header">
      <div class="doc-list-label">${x(phaseLabel)}</div>
      <button class="btn btn-sm" onclick="openNewDocModal()" title="Add document to this phase">+</button>
    </div>` + phaseHtml + sharedHtml;
}

function setPhase(phase) {
  if (editMode && !confirm('Discard unsaved changes?')) return;
  activePhase = phase; activeKey = null; editMode = false; editBuffer = null;
  renderPhaseTabs(); renderDocList(); renderPhaseOverview();
}

function renderPhaseOverview() {
  const TYPE_ICON = {trigger:'▷', step:'·', signoff:'✓', output:'◆'};
  const phaseDocs  = documents.filter(d => d.phase === activePhase && !d.shared);
  const sharedDocs = documents.filter(d => d.shared);
  const phaseLabel = phases[activePhase] ? phases[activePhase].label : activePhase;
  const phaseColor = phases[activePhase] ? phases[activePhase].color : '#888';

  function flowStrip(d, indent) {
    const flow = d.flow || [];
    const stepAiCount = {};
    (d.aiTasks||[]).forEach(t => { if (t.step) stepAiCount[t.step] = (stepAiCount[t.step]||0)+1; });
    flow.forEach(s => { (s.substeps||[]).forEach(cs => { if (cs.aiTask) stepAiCount[s.name] = (stepAiCount[s.name]||0)+1; }); });

    const steps = flow.map((s,si) => {
      const ai = stepAiCount[s.name] || 0;
      return `<span class="po-step po-step--${s.type}" title="${x(s.sub||'')}">
        ${TYPE_ICON[s.type]||'·'} ${x(s.name)}${ai?`<span class="po-step-ai">${ai}</span>`:''}
      </span>${si < flow.length-1 ? '<span class="po-arr">›</span>' : ''}`;
    }).join('');

    return `<div class="po-row" onclick="showDoc('${d.key}')">
      <div class="po-doc-label" style="${indent?`padding-left:${indent}px`:''}">
        ${indent ? '<span class="po-doc-indent">└</span>' : ''}
        <div>
          <div class="po-doc-title">${x(d.title)}</div>
          ${d.sub ? `<div class="po-doc-sub">${x(d.sub)}</div>` : ''}
        </div>
      </div>
      <div class="po-flow">${steps || '<span class="po-no-flow">No flow defined</span>'}</div>
    </div>`;
  }

  const items = _sortByHierarchy(phaseDocs);
  const rowsHtml = items.length
    ? items.map(({d, depth}) => flowStrip(d, depth * 14)).join('')
    : '<div class="po-empty">No documents in this phase.</div>';

  const sharedHtml = sharedDocs.length
    ? `<div class="po-section-label">Shared templates</div>${sharedDocs.map(d => flowStrip(d, 0)).join('')}`
    : '';

  document.getElementById('detail').innerHTML = `
    <div class="po-wrap">
      <div class="po-hd">
        <span class="po-hd-dot" style="background:${phaseColor}"></span>
        <span class="po-hd-title">${x(phaseLabel)}</span>
        <span class="po-hd-count">${phaseDocs.length} doc${phaseDocs.length!==1?'s':''}</span>
        <button class="btn btn-sm" onclick="openNewDocModal()" style="margin-left:auto">+ Add</button>
      </div>
      <div class="po-legend">
        <span class="po-step po-step--trigger">▷ trigger</span>
        <span class="po-step po-step--step">· step</span>
        <span class="po-step po-step--signoff">✓ sign-off</span>
        <span class="po-step po-step--output">◆ output</span>
        <span class="po-legend-ai">🤖 = AI tasks on step</span>
      </div>
      ${rowsHtml}${sharedHtml}
    </div>`;
}

function renderSchemaView() {
  document.getElementById('doc-list').innerHTML = '';

  // Build node id map (key → sanitized Mermaid id)
  const toId = k => k.replace(/[^a-z0-9]/gi, '_');
  window._schemaKeyMap = {};
  documents.forEach(d => { window._schemaKeyMap[toId(d.key)] = d.key; });

  window.schemaNodeClick = nodeId => {
    const key = window._schemaKeyMap[nodeId];
    if (key) { setViewMode('docs'); showDoc(key); }
  };

  const phaseOrder = Object.keys(phases);
  // Main flow phases (left to right)
  const mainPhases   = phaseOrder.filter(pk => !['governance','architecture'].includes(pk));
  const bottomPhases = phaseOrder.filter(pk =>  ['governance','architecture'].includes(pk));

  const lines = ['flowchart LR'];

  // classDef per phase (color from phases config)
  phaseOrder.forEach(pk => {
    const col = (phases[pk]?.color || '#888').replace('#','');
    lines.push(`  classDef phase_${pk} fill:#${col}22,stroke:#${col},color:#333,rx:6`);
  });
  lines.push('  classDef shared fill:#f0e6ff,stroke:#9b72cf,color:#333');

  // Subgraphs
  const allPhases = [...mainPhases, ...bottomPhases];
  allPhases.forEach(pk => {
    const ph = phases[pk];
    const docs = documents.filter(d => d.phase === pk && !d.shared);
    if (!docs.length) return;
    lines.push(`  subgraph sg_${pk}["${ph.label}"]`);
    docs.forEach(d => {
      const label = d.title.length > 22 ? d.title.slice(0,20)+'…' : d.title;
      lines.push(`    ${toId(d.key)}["${label}"]`);
    });
    lines.push('  end');
  });

  // Shared docs (no subgraph)
  const shared = documents.filter(d => d.shared);
  shared.forEach(d => {
    const label = d.title.length > 22 ? d.title.slice(0,20)+'…' : d.title;
    lines.push(`  ${toId(d.key)}(["${label}"])`);
  });

  // Edges — parent relationships (solid)
  documents.forEach(d => {
    if (d.parent && documents.find(p => p.key === d.parent)) {
      lines.push(`  ${toId(d.parent)} --> ${toId(d.key)}`);
    }
  });

  // Edges — refs (dashed)
  documents.forEach(d => {
    (d.refs||[]).filter(r => r.dir === '→' && r.key).forEach(r => {
      if (documents.find(t => t.key === r.key)) {
        lines.push(`  ${toId(d.key)} -.-> ${toId(r.key)}`);
      }
    });
  });

  // class assignments
  phaseOrder.forEach(pk => {
    const ids = documents.filter(d => d.phase === pk && !d.shared).map(d => toId(d.key));
    if (ids.length) lines.push(`  class ${ids.join(',')} phase_${pk}`);
  });
  if (shared.length) lines.push(`  class ${shared.map(d=>toId(d.key)).join(',')} shared`);

  // Click handlers
  documents.forEach(d => {
    lines.push(`  click ${toId(d.key)} schemaNodeClick`);
  });

  const mermaidSrc = lines.join('\n');

  document.getElementById('detail').innerHTML = `
    <div class="sc-diagram-wrap">
      <div class="sc-diagram-hd">
        <span style="font-size:13px;font-weight:600;color:var(--text)">Document Schema</span>
        <span style="font-size:11px;color:var(--text-faint);margin-left:8px">solid arrow = parent/child · dashed = reference · click node to open</span>
      </div>
      <div class="sc-diagram-body">
        <pre class="mermaid sc-mermaid">${mermaidSrc}</pre>
      </div>
    </div>`;

  if (window.mermaid) {
    setTimeout(() => mermaid.run({ querySelector: '.sc-mermaid' }), 0);
  }
}

// init is called by initData() in storage.js after JSON loads
