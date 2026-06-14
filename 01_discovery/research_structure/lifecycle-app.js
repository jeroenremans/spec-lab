// lifecycle-app.js — Application logic for Document Lifecycle tool

const STORAGE_KEY = 'doc-lifecycle-v3';
const PHASE_KEY   = 'doc-lifecycle-phases-v1';
const ROLES_KEY   = 'doc-lifecycle-roles-v1';
const FLOW_TYPES  = ['trigger','step','signoff','output'];

// ─── Storage ──────────────────────────────────────────────────────────────
function loadPhases() {
  try { const r = localStorage.getItem(PHASE_KEY); return r ? JSON.parse(r) : clone(DEFAULT_PHASES); }
  catch(e) { return clone(DEFAULT_PHASES); }
}
function savePhases() { localStorage.setItem(PHASE_KEY, JSON.stringify(phases)); }

function loadRoles() {
  try { const r = localStorage.getItem(ROLES_KEY); return r ? JSON.parse(r) : clone(DEFAULT_ROLES); }
  catch(e) { return clone(DEFAULT_ROLES); }
}
function saveRoles() { localStorage.setItem(ROLES_KEY, JSON.stringify(roles)); }

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_DOCUMENTS);
    const saved = JSON.parse(raw);
    const savedMap = Object.fromEntries(saved.map(d => [d.key, d]));
    const merged = DEFAULT_DOCUMENTS.map(def => ({ ...def, ...(savedMap[def.key] || {}) }));
    const defaultKeys = new Set(DEFAULT_DOCUMENTS.map(d => d.key));
    saved.filter(d => !defaultKeys.has(d.key)).forEach(d => merged.push(d));
    return merged;
  } catch(e) { return clone(DEFAULT_DOCUMENTS); }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(documents)); }

function resetData() {
  if (!confirm('Discard all changes and restore defaults?')) return;
  [STORAGE_KEY, PHASE_KEY, ROLES_KEY].forEach(k => localStorage.removeItem(k));
  phases = clone(DEFAULT_PHASES);
  roles  = clone(DEFAULT_ROLES);
  documents = clone(DEFAULT_DOCUMENTS);
  editMode = false; editBuffer = null;
  setViewMode('docs');
  setPhase(Object.keys(phases)[0]);
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }

// ─── Import / Export ──────────────────────────────────────────────────────
function exportJSON() {
  const payload = { version: 3, phases, roles, documents };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'document-lifecycle.json'; a.click();
  URL.revokeObjectURL(url);
}
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        documents = data;
      } else if (data.documents && Array.isArray(data.documents)) {
        documents = data.documents;
        if (data.phases) phases = data.phases;
        if (data.roles)  roles  = data.roles;
      } else { throw new Error('Unrecognised format'); }
      saveData(); savePhases(); saveRoles();
      editMode = false; editBuffer = null;
      setViewMode('docs');
      setPhase(Object.keys(phases)[0]);
    } catch(err) { alert('Import failed: ' + err.message); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ─── State ────────────────────────────────────────────────────────────────
let phases    = loadPhases();
let roles     = loadRoles();
let documents = loadData();
let activePhase = Object.keys(phases)[0];
let activeKey   = null;
let editMode    = false;
let editBuffer  = null;
let viewMode    = 'docs'; // 'docs' | 'roles'

// ─── View mode switching ──────────────────────────────────────────────────
function setViewMode(mode) {
  if (editMode && !confirm('Discard unsaved changes?')) return;
  viewMode = mode;
  editMode = false; editBuffer = null;
  renderPhaseTabs();
  if (mode === 'roles') {
    renderRolesPage();
  } else {
    renderDocList();
    document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
  }
}

// ─── Roles page ───────────────────────────────────────────────────────────
function renderRolesPage() {
  document.getElementById('doc-list').innerHTML = `
    <div style="padding:14px;border-bottom:1px solid var(--border)">
      <button class="btn btn-sm" onclick="setViewMode('docs')">← Documents</button>
    </div>
    <div style="padding:8px 14px;font-size:11px;color:var(--text-faint);line-height:1.5">
      Roles used in document owner / reviewer / sign-off fields. Optionally assign a name.
    </div>`;

  const rows = roles.map((r,i) => `
    <div class="role-edit-row" data-i="${i}">
      <input class="edit-input" placeholder="Role title" value="${x(r.title)}"
        onchange="roles[${i}].title=this.value; saveRoles();"
        style="flex:1">
      <input class="edit-input" placeholder="Name (optional)" value="${x(r.name||'')}"
        onchange="roles[${i}].name=this.value; saveRoles();"
        style="flex:1">
      <button class="btn btn-sm" onclick="deleteRole(${i})">✕</button>
    </div>`).join('');

  document.getElementById('detail').innerHTML = `
    <div style="max-width:700px">
      <div class="detail-hd">
        <div class="detail-hd-text">
          <div class="doc-title">Project Roles</div>
          <div class="doc-path">Define roles and optionally assign names for this project</div>
        </div>
        <div class="detail-hd-actions">
          <button class="btn" onclick="addRole()">+ Add Role</button>
        </div>
      </div>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:6px;overflow:hidden;margin-bottom:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr 28px;gap:8px;padding:8px 12px;background:var(--surface);border-bottom:1px solid var(--border)">
          <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text-faint)">Role</div>
          <div style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:var(--text-faint)">Name (optional)</div>
          <div></div>
        </div>
        <div id="roles-list" style="padding:8px 12px">
          ${rows || '<div style="font-size:12px;color:var(--text-faint);padding:8px 0">No roles defined.</div>'}
        </div>
      </div>
      <p style="font-size:12px;color:var(--text-faint);line-height:1.6">
        Changes are saved automatically. Roles are available in all document owner, reviewer, and sign-off fields.
      </p>
    </div>`;
}

function addRole() {
  roles.push({ key: 'role-'+Date.now(), title: '', name: '' });
  saveRoles();
  renderRolesPage();
}
function deleteRole(i) {
  roles.splice(i, 1);
  saveRoles();
  renderRolesPage();
}

// ─── Phase management modal ───────────────────────────────────────────────
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

// ─── New document modal ───────────────────────────────────────────────────
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
    const title = document.getElementById('nd-title').value.trim();
    const sub   = document.getElementById('nd-sub').value.trim();
    const phase = document.getElementById('nd-phase').value;
    const key   = document.getElementById('nd-key').value.trim() || uniqueDocKey(title.toLowerCase().replace(/[^a-z0-9]+/g,'-'));
    const path  = document.getElementById('nd-path').value.trim();
    if (!title) { alert('Title is required'); return; }
    if (!key || documents.find(d => d.key === key)) { alert('Key is empty or already in use'); return; }
    const doc = { phase, key, title, sub, path, owner:'', reviewers:[], signoff:'', lifecycle:'', trigger:'', doel:'', inputs:[], outputs:[], flow:[], note:'', refs:[], creation:[], template:'', aiTasks:[] };
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

// ─── Delete document ──────────────────────────────────────────────────────
function confirmDeleteDoc(key) {
  const d = documents.find(z => z.key === key);
  if (!d || !confirm(`Delete "${d.title}"? This cannot be undone.`)) return;
  documents = documents.filter(z => z.key !== key);
  saveData(); activeKey = null; editMode = false; editBuffer = null;
  renderDocList();
  document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
}

// ─── Phase & list render ──────────────────────────────────────────────────
function renderPhaseTabs() {
  const tabs = Object.entries(phases).map(([k,v]) =>
    `<div class="phase-tab${viewMode==='docs'&&k===activePhase?' active':''}" onclick="setPhaseTab('${k}')">
      <span class="phase-dot" style="background:${x(v.color)}"></span>${x(v.label)}
    </div>`).join('');
  const rolesTab = `<div class="phase-tab roles-tab${viewMode==='roles'?' active':''}" onclick="setViewMode('roles')" style="margin-left:auto">👥 Roles</div>`;
  document.getElementById('phase-nav').innerHTML = tabs + rolesTab;
}

function setPhaseTab(phase) {
  if (viewMode !== 'docs') {
    viewMode = 'docs';
    editMode = false; editBuffer = null;
  }
  setPhase(phase);
}

function renderDocList() {
  if (viewMode === 'roles') { return; }
  const docs = documents.filter(d => d.phase === activePhase);
  const phaseLabel = phases[activePhase] ? phases[activePhase].label : activePhase;
  document.getElementById('doc-list').innerHTML =
    `<div class="doc-list-header">
      <div class="doc-list-label">${x(phaseLabel)}</div>
      <button class="btn btn-sm" onclick="openNewDocModal()" title="Add document to this phase">+</button>
    </div>` +
    (docs.length
      ? docs.map(d =>
          `<div class="doc-item${d.key===activeKey?' active':''}" onclick="showDoc('${d.key}')">
            <div class="doc-item-title">${x(d.title)}</div>
            <div class="doc-item-sub">${x(d.sub||'')}</div>
          </div>`).join('')
      : `<div style="padding:20px 14px;font-size:12px;color:var(--text-faint)">No documents in this phase.</div>`);
}

function setPhase(phase) {
  if (editMode && !confirm('Discard unsaved changes?')) return;
  activePhase = phase; activeKey = null; editMode = false; editBuffer = null;
  renderPhaseTabs(); renderDocList();
  document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
}

// ─── View mode ─────────────────────────────────────────────────────────────
function showDoc(key) {
  activeKey = key; editMode = false; editBuffer = null;
  renderDocList();
  const d = documents.find(z => z.key === key);
  if (!d) return;

  // Process section
  const flowHtml = (d.flow||[]).map((s,i) => {
    const arr = i < d.flow.length-1 ? `<div class="flow-arrow">→</div>` : '';
    return `<div class="flow-step"><div class="step-box ${s.type}">
      <div class="step-name">${x(s.name)}</div>
      <div class="step-sub">${x(s.sub)}</div>
    </div>${arr}</div>`;
  }).join('');

  // Creation process section
  const creation = d.creation || [];
  const creationHtml = creation.length ? `
    <div class="section">
      <div class="section-title">Creation Process</div>
      <table class="creation-table">
        <thead><tr><th>#</th><th>Step</th><th>Method / Technique</th><th>Tools</th><th>AI</th></tr></thead>
        <tbody>${creation.map((s,i)=>`<tr>
          <td style="color:var(--text-faint);font-size:11px">${i+1}</td>
          <td>${x(s.name)}</td>
          <td style="color:var(--text-muted)">${x(s.method)}</td>
          <td style="color:var(--text-faint);font-family:var(--mono);font-size:11px">${x(s.tools)}</td>
          <td style="text-align:center">${s.ai?'<span class="ai-badge">✓ AI</span>':'<span style="color:var(--text-faint)">—</span>'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>` : '';

  // References
  const refsHtml = (d.refs||[]).length ? `
    <div class="section">
      <div class="section-title">References</div>
      <div class="ref-list">${d.refs.map(r => {
        const target = documents.find(z => z.key === r.key);
        return `<div class="ref-row">
          <span class="ref-dir">${x(r.dir)}</span>
          <span class="ref-badge">${target ? x(target.path) : x(r.key||'—')}</span>
          ${target ? `<span class="ref-title">${x(target.title)}</span>` : ''}
        </div>`;
      }).join('')}</div>
    </div>` : '';

  // AI Tasks
  const tasks = d.aiTasks || [];
  const aiHtml = tasks.length ? `
    <div class="section">
      <div class="section-title">AI Tasks / Subagents</div>
      ${tasks.map((t,i)=>`
        <div class="ai-task-card">
          <div class="ai-task-header" onclick="toggleAiTask(${i})">
            <div class="ai-task-name">🤖 ${x(t.name)}</div>
            <div class="ai-persona-pill">${x(t.persona)}</div>
            <span id="ai-chev-${i}" style="font-size:11px;color:var(--text-faint)">▼</span>
          </div>
          <div class="ai-task-body" id="ai-body-${i}">
            <div class="ai-objective">${x(t.objective)}</div>
            <div class="ai-prompt-label">Prompt</div>
            <div class="ai-prompt-block">${x(t.prompt)}</div>
          </div>
        </div>`).join('')}
    </div>` : `
    <div class="section">
      <div class="section-title">AI Tasks / Subagents</div>
      <div style="font-size:12px;color:var(--text-faint);font-style:italic">No AI tasks — click Edit to add.</div>
    </div>`;

  // Template
  const tmplHtml = `
    <div class="section">
      <div class="section-title">Template</div>
      ${(d.template||'').trim()
        ? `<div class="template-block">${x(d.template)}</div>`
        : `<div style="font-size:12px;color:var(--text-faint);font-style:italic">No template — click Edit to add.</div>`}
    </div>`;

  document.getElementById('detail').innerHTML = `
    <div class="detail-hd">
      <div class="detail-hd-text">
        <div class="doc-title">${x(d.title)}</div>
        <div class="doc-path">${x(d.path||'')}</div>
      </div>
      <div class="detail-hd-actions">
        <button class="btn" onclick="startEdit('${d.key}')">✏ Edit</button>
      </div>
    </div>

    <div class="two-col-section">
      <div>
        <div class="section-label">Document Lifecycle</div>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">Goal</div>
            <div class="meta-value">${x(d.doel||'—')}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Lifecycle</div>
            <div class="meta-value">${x(d.lifecycle||'—')}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Owner</div>
            <div class="meta-value"><span class="role-pill owner">👤 ${x(displayRole(d.owner))}</span></div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Reviewers</div>
            <div class="meta-value">${(d.reviewers||[]).map(r=>`<span class="role-pill">👤 ${x(displayRole(r))}</span>`).join('')||'—'}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Sign-off</div>
            <div class="meta-value">${d.signoff?`<span class="role-pill owner">✓ ${x(displayRole(d.signoff))}</span>`:'<span style="font-size:12px;color:var(--text-faint)">Not required</span>'}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">Trigger</div>
            <div class="meta-value">${x(d.trigger||'—')}</div>
          </div>
        </div>
      </div>
    </div>

    ${d.note ? `<div class="note-box"><span>ℹ</span><span>${x(d.note)}</span></div>` : ''}

    <div class="io-grid">
      <div class="io-card">
        <div class="io-header">⬇ Input</div>
        <div class="io-body">${(d.inputs||[]).map(i=>`<div class="io-item"><span class="io-dot"></span>${x(i)}</div>`).join('')||'<div class="io-item" style="color:var(--text-faint)">None defined</div>'}</div>
      </div>
      <div class="io-card">
        <div class="io-header">⬆ Output</div>
        <div class="io-body">${(d.outputs||[]).map(o=>`<div class="io-item"><span class="io-dot"></span>${x(o)}</div>`).join('')||'<div class="io-item" style="color:var(--text-faint)">None defined</div>'}</div>
      </div>
    </div>

    ${creationHtml}

    ${(d.flow||[]).length ? `
    <div class="section">
      <div class="section-title">Lifecycle Flow</div>
      <div class="flow">${flowHtml}</div>
    </div>` : ''}

    ${refsHtml}
    ${aiHtml}
    ${tmplHtml}
  `;
}

function toggleAiTask(i) {
  const body = document.getElementById('ai-body-'+i);
  const chev = document.getElementById('ai-chev-'+i);
  const open = body.classList.toggle('open');
  if (chev) chev.textContent = open ? '▲' : '▼';
}

// ─── Edit mode ─────────────────────────────────────────────────────────────
function startEdit(key) {
  editBuffer = clone(documents.find(z => z.key === key));
  if (!editBuffer.aiTasks)  editBuffer.aiTasks = [];
  if (!editBuffer.creation) editBuffer.creation = [];
  editMode = true;
  renderEdit();
}

function renderEdit() {
  const d = editBuffer;
  document.getElementById('detail').innerHTML = `
    <div class="edit-bar">
      <div style="flex:1;font-size:13px;font-weight:500;color:var(--text-muted)">Editing: ${x(d.title)}</div>
      <button class="btn btn-primary" onclick="saveEdit()">✓ Save</button>
      <button class="btn" onclick="showDoc('${d.key}')">Cancel</button>
    </div>

    <div class="edit-meta-grid">
      <div><div class="edit-label">Title</div><input class="edit-input" id="ef-title" value="${x(d.title||'')}"></div>
      <div><div class="edit-label">Subtitle</div><input class="edit-input" id="ef-sub" value="${x(d.sub||'')}"></div>
      <div><div class="edit-label">Path</div><input class="edit-input" id="ef-path" value="${x(d.path||'')}"></div>
      <div><div class="edit-label">Phase</div>
        <select class="edit-select" id="ef-phase">${phaseSelectOptions(d.phase)}</select>
      </div>
      <div><div class="edit-label">Owner</div>
        <select class="edit-select" id="ef-owner">
          <option value="">— Select role —</option>
          ${roleSelectOptions(d.owner||'')}
        </select>
      </div>
      <div><div class="edit-label">Sign-off</div>
        <select class="edit-select" id="ef-signoff">
          <option value="">— Not required —</option>
          ${roleSelectOptions(d.signoff||'')}
        </select>
      </div>
      <div style="grid-column:span 2"><div class="edit-label">Lifecycle</div><input class="edit-input" id="ef-lifecycle" value="${x(d.lifecycle||'')}"></div>
    </div>
    <div class="edit-field"><div class="edit-label">Trigger</div><input class="edit-input" id="ef-trigger" value="${x(d.trigger||'')}"></div>
    <div class="edit-field"><div class="edit-label">Goal</div><textarea class="edit-textarea" id="ef-doel">${x(d.doel||'')}</textarea></div>
    <div class="edit-field"><div class="edit-label">Note</div><textarea class="edit-textarea" id="ef-note">${x(d.note||'')}</textarea></div>

    <hr>
    <div class="edit-field">
      <div class="edit-label">Reviewers</div>
      <div id="arr-reviewers">${renderRoleArr('reviewers', d.reviewers||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addRoleItem('reviewers')">+ Add Reviewer</button>
    </div>
    <div class="io-grid">
      <div class="edit-field">
        <div class="edit-label">Input</div>
        <div id="arr-inputs">${renderStrArr('inputs', d.inputs||[])}</div>
        <button class="btn btn-sm" style="margin-top:4px" onclick="addStrItem('inputs')">+ Add</button>
      </div>
      <div class="edit-field">
        <div class="edit-label">Output</div>
        <div id="arr-outputs">${renderStrArr('outputs', d.outputs||[])}</div>
        <button class="btn btn-sm" style="margin-top:4px" onclick="addStrItem('outputs')">+ Add</button>
      </div>
    </div>

    <hr>
    <div class="edit-field">
      <div class="edit-label">Creation Process</div>
      <div id="arr-creation">${renderCreationArr(d.creation||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addCreationStep()">+ Add Step</button>
    </div>

    <div class="edit-field">
      <div class="edit-label">Lifecycle Flow Steps</div>
      <div id="arr-flow">${renderFlowArr(d.flow||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addFlowStep()">+ Add</button>
    </div>

    <div class="edit-field">
      <div class="edit-label">References</div>
      <div id="arr-refs">${renderRefsArr(d.refs||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addRef()">+ Add Reference</button>
    </div>

    <hr>
    <div class="edit-field">
      <div class="edit-label">AI Tasks / Subagents</div>
      <div id="arr-ai">${renderAiArr(d.aiTasks||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addAiTask()">+ Add AI Task</button>
    </div>

    <hr>
    <div class="edit-field">
      <div class="edit-label">Template (markdown)</div>
      <textarea class="edit-textarea mono" id="ef-template" style="min-height:200px">${x(d.template||'')}</textarea>
    </div>

    <div class="delete-doc-zone">
      <div class="delete-doc-title">Danger Zone</div>
      <button class="btn btn-danger" onclick="capture(); confirmDeleteDoc('${d.key}')">Delete this document</button>
    </div>
  `;
}

// ─── Sub-renderers ──────────────────────────────────────────────────────────
function renderStrArr(field, arr) {
  return arr.map((v,i) =>
    `<div class="arr-row">
      <input class="edit-input" value="${x(v)}" onchange="updateStrItem('${field}',${i},this.value)">
      <button class="btn btn-sm" onclick="removeStrItem('${field}',${i})">✕</button>
    </div>`).join('');
}

function renderRoleArr(field, arr) {
  return arr.map((v,i) =>
    `<div class="arr-row">
      <select class="edit-select" onchange="updateStrItem('${field}',${i},this.value)">
        <option value="">— Select role —</option>
        ${roleSelectOptions(v)}
      </select>
      <button class="btn btn-sm" onclick="removeStrItem('${field}',${i})">✕</button>
    </div>`).join('');
}

function renderCreationArr(steps) {
  return steps.map((s,i) =>
    `<div class="creation-edit-row">
      <input class="edit-input" placeholder="Step name" value="${x(s.name||'')}" onchange="updateCreation(${i},'name',this.value)">
      <input class="edit-input" placeholder="Method / technique" value="${x(s.method||'')}" onchange="updateCreation(${i},'method',this.value)">
      <input class="edit-input" placeholder="Tools (comma-separated)" value="${x(s.tools||'')}" onchange="updateCreation(${i},'tools',this.value)">
      <label style="display:flex;align-items:center;gap:4px;font-size:12px;white-space:nowrap;cursor:pointer">
        <input type="checkbox" ${s.ai?'checked':''} onchange="updateCreation(${i},'ai',this.checked)"> AI
      </label>
      <button class="btn btn-sm" onclick="removeCreation(${i})">✕</button>
    </div>`).join('');
}

function renderFlowArr(flow) {
  return flow.map((s,i) =>
    `<div class="flow-edit-row">
      <input class="edit-input" placeholder="Name" value="${x(s.name||'')}" onchange="updateFlowStep(${i},'name',this.value)">
      <input class="edit-input" placeholder="Sub" value="${x(s.sub||'')}" onchange="updateFlowStep(${i},'sub',this.value)">
      <select class="edit-select" onchange="updateFlowStep(${i},'type',this.value)">
        ${FLOW_TYPES.map(t=>`<option value="${t}"${s.type===t?' selected':''}>${t}</option>`).join('')}
      </select>
      <button class="btn btn-sm" onclick="removeFlowStep(${i})">✕</button>
    </div>`).join('');
}

function renderRefsArr(refs) {
  return refs.map((r,i) =>
    `<div class="ref-edit-row">
      <select class="edit-select" onchange="updateRef(${i},'dir',this.value)">
        <option value="→"${r.dir==='→'?' selected':''}>→ To</option>
        <option value="←"${r.dir==='←'?' selected':''}>← From</option>
      </select>
      <select class="edit-select" onchange="updateRef(${i},'key',this.value)">
        <option value="">— Select document —</option>
        ${docSelectOptions(r.key)}
      </select>
      <button class="btn btn-sm" onclick="removeRef(${i})">✕</button>
    </div>`).join('');
}

function renderAiArr(tasks) {
  return tasks.map((t,i) =>
    `<div class="ai-task-edit">
      <div class="ai-task-edit-header">
        <input class="edit-input" placeholder="Task name" value="${x(t.name||'')}" onchange="updateAi(${i},'name',this.value)">
        <input class="edit-input" placeholder="Persona" value="${x(t.persona||'')}" style="flex:0 0 200px" onchange="updateAi(${i},'persona',this.value)">
        <button class="btn btn-sm" onclick="removeAiTask(${i})">✕</button>
      </div>
      <div class="edit-field">
        <div class="edit-label">Objective</div>
        <textarea class="edit-textarea" onchange="updateAi(${i},'objective',this.value)">${x(t.objective||'')}</textarea>
      </div>
      <div class="edit-field" style="margin-bottom:0">
        <div class="edit-label">Prompt</div>
        <textarea class="edit-textarea mono" onchange="updateAi(${i},'prompt',this.value)">${x(t.prompt||'')}</textarea>
      </div>
    </div>`).join('');
}

// ─── Mutation helpers ────────────────────────────────────────────────────────
function capture() {
  ['title','sub','path','lifecycle','trigger','doel','note','template'].forEach(id => {
    const el = document.getElementById('ef-'+id);
    if (el) editBuffer[id] = el.value;
  });
  const owner   = document.getElementById('ef-owner');
  const signoff = document.getElementById('ef-signoff');
  const phase   = document.getElementById('ef-phase');
  if (owner)   editBuffer.owner   = owner.value;
  if (signoff) editBuffer.signoff = signoff.value;
  if (phase)   editBuffer.phase   = phase.value;
}

function updateStrItem(f,i,v) { editBuffer[f][i]=v; }
function removeStrItem(f,i) { capture(); editBuffer[f].splice(i,1); document.getElementById('arr-'+f).innerHTML=(f==='reviewers'?renderRoleArr:renderStrArr)(f,editBuffer[f]); }
function addStrItem(f) { capture(); editBuffer[f].push(''); document.getElementById('arr-'+f).innerHTML=renderStrArr(f,editBuffer[f]); }
function addRoleItem(f) { capture(); editBuffer[f].push(''); document.getElementById('arr-'+f).innerHTML=renderRoleArr(f,editBuffer[f]); }

function updateCreation(i,k,v) { editBuffer.creation[i][k]=v; }
function removeCreation(i) { capture(); editBuffer.creation.splice(i,1); document.getElementById('arr-creation').innerHTML=renderCreationArr(editBuffer.creation); }
function addCreationStep() { capture(); editBuffer.creation.push({name:'',method:'',tools:'',ai:false}); document.getElementById('arr-creation').innerHTML=renderCreationArr(editBuffer.creation); }

function updateFlowStep(i,k,v) { editBuffer.flow[i][k]=v; }
function removeFlowStep(i) { capture(); editBuffer.flow.splice(i,1); document.getElementById('arr-flow').innerHTML=renderFlowArr(editBuffer.flow); }
function addFlowStep() { capture(); editBuffer.flow.push({name:'',sub:'',type:'step'}); document.getElementById('arr-flow').innerHTML=renderFlowArr(editBuffer.flow); }

function updateRef(i,k,v) { editBuffer.refs[i][k]=v; }
function removeRef(i) { capture(); editBuffer.refs.splice(i,1); document.getElementById('arr-refs').innerHTML=renderRefsArr(editBuffer.refs); }
function addRef() { capture(); editBuffer.refs.push({dir:'→',key:''}); document.getElementById('arr-refs').innerHTML=renderRefsArr(editBuffer.refs); }

function updateAi(i,k,v) { editBuffer.aiTasks[i][k]=v; }
function removeAiTask(i) { capture(); editBuffer.aiTasks.splice(i,1); document.getElementById('arr-ai').innerHTML=renderAiArr(editBuffer.aiTasks); }
function addAiTask() { capture(); editBuffer.aiTasks.push({name:'',persona:'',objective:'',prompt:''}); document.getElementById('arr-ai').innerHTML=renderAiArr(editBuffer.aiTasks); }

// ─── Save ────────────────────────────────────────────────────────────────────
function saveEdit() {
  capture();
  const idx = documents.findIndex(z => z.key === editBuffer.key);
  if (idx !== -1) documents[idx] = clone(editBuffer);
  saveData();
  const newPhase = editBuffer.phase;
  editMode = false; editBuffer = null;
  if (newPhase !== activePhase) { activePhase = newPhase; renderPhaseTabs(); }
  renderDocList(); showDoc(activeKey);
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function x(s) {
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function displayRole(title) {
  if (!title) return '—';
  const role = roles.find(r => r.title === title);
  if (role && role.name) return `${title} (${role.name})`;
  return title;
}

function roleSelectOptions(selected) {
  return roles.map(r => {
    const label = r.name ? `${r.title} (${r.name})` : r.title;
    return `<option value="${x(r.title)}"${r.title===selected?' selected':''}>${x(label)}</option>`;
  }).join('');
}

function docSelectOptions(selectedKey) {
  return documents
    .filter(d => editBuffer && d.key !== editBuffer.key)
    .map(d => `<option value="${x(d.key)}"${d.key===selectedKey?' selected':''}>${x(d.title)} — ${x(d.path||d.key)}</option>`)
    .join('');
}

function phaseSelectOptions(selected) {
  return Object.entries(phases).map(([k,v]) =>
    `<option value="${x(k)}"${k===selected?' selected':''}>${x(v.label)}</option>`).join('');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
renderPhaseTabs();
renderDocList();
