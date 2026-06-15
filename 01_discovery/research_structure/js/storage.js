// Storage, state, import/export, utilities

const STORAGE_KEY = 'doc-lifecycle-v3';
const PHASE_KEY   = 'doc-lifecycle-phases-v1';
const ROLES_KEY   = 'doc-lifecycle-roles-v1';
const FLOW_TYPES  = ['trigger','step','signoff','output'];

// ─── Defaults (populated async via initData) ──────────────────────────────────
let DEFAULT_PHASES    = {};
let DEFAULT_ROLES     = [];
let DEFAULT_DOCUMENTS = [];

// ─── Load / Save ──────────────────────────────────────────────────────────────
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
  phases    = clone(DEFAULT_PHASES);
  roles     = clone(DEFAULT_ROLES);
  documents = clone(DEFAULT_DOCUMENTS);
  editMode = false; editBuffer = null;
  setViewMode('docs');
  setPhase(Object.keys(phases)[0]);
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

// ─── Import / Export ──────────────────────────────────────────────────────────
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

// ─── State ────────────────────────────────────────────────────────────────────
let phases    = {};
let roles     = [];
let documents = [];
let activePhase = null;
let activeKey   = null;
let editMode    = false;
let editBuffer  = null;
let viewMode    = 'docs'; // 'docs' | 'roles' | 'tree'

// ─── Boot ─────────────────────────────────────────────────────────────────────
const DATA_FILES = [
  'phases.json', 'roles.json',
  'docs-intake.json', 'docs-discovery.json', 'docs-solution.json',
  'docs-delivery.json', 'docs-governance.json', 'docs-architecture.json',
];

async function initData() {
  const base = 'data/';
  const [phasesJson, rolesJson, ...docArrays] = await Promise.all(
    DATA_FILES.map(f => fetch(base + f).then(r => { if (!r.ok) throw new Error(f); return r.json(); }))
  );
  _applyDefaults(phasesJson, rolesJson, docArrays.flat());
}

const _PHASE_ORDER  = ['intake','discovery','solution','delivery','governance','architecture'];
const _PHASE_COLORS = ['#6c8ebf','#82b366','#d6b656','#b85450','#9673a6','#607080'];

function _derivePhasesFromDocs(docsFlat) {
  const seen = [...new Set(docsFlat.map(d => d.phase).filter(Boolean))];
  const ordered = [..._PHASE_ORDER.filter(k => seen.includes(k)), ...seen.filter(k => !_PHASE_ORDER.includes(k))];
  const p = {};
  ordered.forEach((k, i) => { p[k] = { label: k.charAt(0).toUpperCase() + k.slice(1), color: _PHASE_COLORS[i % _PHASE_COLORS.length] }; });
  return p;
}

function _applyDefaults(phasesJson, rolesJson, docsFlat) {
  DEFAULT_PHASES    = (phasesJson && Object.keys(phasesJson).length) ? phasesJson : _derivePhasesFromDocs(docsFlat);
  DEFAULT_ROLES     = rolesJson;
  DEFAULT_DOCUMENTS = docsFlat;
  phases    = loadPhases();
  roles     = loadRoles();
  documents = loadData();
  // Safety net: if phases still empty after localStorage, derive fresh
  if (!Object.keys(phases).length) phases = _derivePhasesFromDocs(docsFlat);
  activePhase = Object.keys(phases)[0];
  renderPhaseTabs();
  renderDocList();
}

function _showUploadFallback(err) {
  document.getElementById('detail').innerHTML = `
    <div style="max-width:540px;margin:48px auto">
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:32px;margin-bottom:12px">📂</div>
        <div style="font-size:15px;font-weight:500;margin-bottom:6px">Data files not reachable via server</div>
        <div style="font-size:12px;color:var(--text-faint);line-height:1.6">
          Running on <code>file://</code> — browsers block <code>fetch()</code> for local files.<br>
          Select the files below, or use <strong>↑ Import</strong> with a previously exported JSON.
        </div>
      </div>
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:12px;line-height:1.9">
        <div style="font-weight:500;margin-bottom:6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint)">Select all 8 files from the data/ folder</div>
        <div style="font-family:var(--mono);color:var(--text-muted)">
          phases.json &nbsp;·&nbsp; roles.json<br>
          docs-intake.json &nbsp;·&nbsp; docs-discovery.json &nbsp;·&nbsp; docs-solution.json<br>
          docs-delivery.json &nbsp;·&nbsp; docs-governance.json &nbsp;·&nbsp; docs-architecture.json
        </div>
      </div>
      <div style="text-align:center">
        <label class="btn btn-primary" style="cursor:pointer;font-size:13px;padding:8px 18px">
          📁 Select all data/*.json files
          <input type="file" accept=".json" multiple onchange="loadFromFiles(event)" style="display:none">
        </label>
        <div style="margin-top:10px;font-size:11px;color:var(--text-faint)">
          Tip: <kbd>Cmd+A</kbd> (Mac) or <kbd>Ctrl+A</kbd> (Windows) to select all files in the folder at once.
        </div>
      </div>
    </div>`;
}

function loadFromFiles(event) {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  const reads = files.map(f => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res({ name: f.name, data: JSON.parse(e.target.result) });
    r.onerror = rej;
    r.readAsText(f);
  }));

  Promise.all(reads).then(results => {
    // Clear stale localStorage so freshly uploaded data is not overwritten by old saved state
    [STORAGE_KEY, PHASE_KEY, ROLES_KEY].forEach(k => localStorage.removeItem(k));

    // Full export: single file with { version, phases, roles, documents }
    if (results.length === 1 && results[0].data.documents) {
      const d = results[0].data;
      _applyDefaults(d.phases || DEFAULT_PHASES, d.roles || DEFAULT_ROLES, d.documents);
      return;
    }

    // Individual files keyed by filename
    const map = Object.fromEntries(results.map(r => [r.name, r.data]));
    const phasesJson = map['phases.json'] || null;
    const rolesJson  = map['roles.json']  || [];
    const docPhases  = ['intake','discovery','solution','delivery','governance','architecture'];
    const docsFlat   = docPhases.flatMap(p => map[`docs-${p}.json`] || []);

    if (!docsFlat.length) { alert('No docs-*.json files found.\nSelect the files from the data/ folder.'); return; }
    if (!phasesJson) console.warn('phases.json not uploaded — deriving phases from document data.');
    _applyDefaults(phasesJson || {}, rolesJson, docsFlat);
  }).catch(err => alert('Read failed: ' + err.message));

  event.target.value = '';
}

initData().catch(err => _showUploadFallback(err));

// ─── Utilities ────────────────────────────────────────────────────────────────
function x(s) {
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function displayRole(title) {
  if (!title) return '—';
  const role = roles.find(r => r.title === title);
  if (role && role.name) return `${title} (${role.name})`;
  return title;
}

function roleAvatarFor(title) {
  if (!title) return '👤';
  const r = roles.find(r => r.title === title);
  return (r && r.avatar) ? r.avatar : '👤';
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
