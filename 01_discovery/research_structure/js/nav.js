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
  } else {
    renderDocList();
    if (activeKey) showDoc(activeKey);
    else document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
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

// ─── Delete document ──────────────────────────────────────────────────────────
function confirmDeleteDoc(key) {
  const d = documents.find(z => z.key === key);
  if (!d || !confirm(`Delete "${d.title}"? This cannot be undone.`)) return;
  documents = documents.filter(z => z.key !== key);
  saveData(); activeKey = null; editMode = false; editBuffer = null;
  renderDocList();
  document.getElementById('detail').innerHTML = '<div class="detail-empty">← Select a document</div>';
}

// ─── Phase tabs & doc list ────────────────────────────────────────────────────
function renderPhaseTabs() {
  const tabs = Object.entries(phases).map(([k,v]) =>
    `<div class="phase-tab${viewMode==='docs'&&k===activePhase?' active':''}" onclick="setPhaseTab('${k}')">
      <span class="phase-dot" style="background:${x(v.color)}"></span>${x(v.label)}
    </div>`).join('');
  const treeTab = `<div class="phase-tab tree-tab${viewMode==='tree'?' active':''}" onclick="setViewMode('tree')">🌲 Tree</div>`;
  const rolesTab = `<div class="phase-tab roles-tab${viewMode==='roles'?' active':''}" onclick="setViewMode('roles')" style="margin-left:auto">👥 Roles</div>`;
  document.getElementById('phase-nav').innerHTML = tabs + treeTab + rolesTab;
}

function setPhaseTab(phase) {
  if (viewMode !== 'docs') {
    viewMode = 'docs';
    editMode = false; editBuffer = null;
  }
  setPhase(phase);
}

function renderDocList() {
  if (viewMode === 'roles' || viewMode === 'tree') return;
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

// init is called by initData() in storage.js after JSON loads
