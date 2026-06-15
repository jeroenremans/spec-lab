// Edit mode: startEdit, renderEdit, sub-renderers, mutation helpers, saveEdit

function startEdit(key) {
  editBuffer = clone(documents.find(z => z.key === key));
  if (!editBuffer.aiTasks) editBuffer.aiTasks = [];
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
      <div style="grid-column:span 2"><div class="edit-label">Parent Document</div>
        <select class="edit-select" id="ef-parent">
          <option value="">— No parent —</option>
          ${documents.filter(doc=>doc.key!==d.key).map(doc=>`<option value="${x(doc.key)}"${doc.key===d.parent?' selected':''}>${x(doc.title)} (${x(doc.phase)})</option>`).join('')}
        </select>
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
      <div class="edit-label">Lifecycle Flow Steps</div>
      <div id="arr-flow">${renderFlowArr(d.flow||[])}</div>
      <button class="btn btn-sm" style="margin-top:4px" onclick="addFlowStep()">+ Add step</button>
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

    <div class="edit-field">
      <div class="edit-label">Diagram (Mermaid — paste output from AI task, leave empty if not needed)</div>
      <textarea class="edit-textarea mono" id="ef-diagram" style="min-height:120px" placeholder="flowchart LR&#10;  A[Start] --&gt; B[Step]">${x(d.diagram||'')}</textarea>
    </div>

    <div class="delete-doc-zone">
      <div class="delete-doc-title">Danger Zone</div>
      <button class="btn btn-danger" onclick="capture(); confirmDeleteDoc('${d.key}')">Delete this document</button>
    </div>
  `;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────
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
      <button class="btn btn-sm" onclick="removeCreation(${i})">✕</button>
    </div>`).join('');
}

function renderFlowArr(flow) {
  return flow.map((s,i) => {
    const hasSubsteps = s.type === 'step' || s.type === 'signoff';
    return `<div class="flow-edit-card">
      <div class="flow-edit-row">
        <input class="edit-input" placeholder="Name" value="${x(s.name||'')}" onchange="updateFlowStep(${i},'name',this.value)">
        <input class="edit-input" placeholder="Sub-label" style="flex:0 0 140px" value="${x(s.sub||'')}" onchange="updateFlowStep(${i},'sub',this.value)">
        <select class="edit-select" style="flex:0 0 96px" onchange="updateFlowStep(${i},'type',this.value)">
          ${FLOW_TYPES.map(t=>`<option value="${t}"${s.type===t?' selected':''}>${t}</option>`).join('')}
        </select>
        <button class="btn btn-sm" onclick="removeFlowStep(${i})">✕</button>
      </div>
      <div class="flow-edit-details">
        <div class="flow-edit-details-row">
          <div style="flex:1">
            <div class="edit-label" style="margin-bottom:3px">Description</div>
            <textarea class="edit-textarea" rows="2" placeholder="What happens in this step? Who does what?" onchange="updateFlowStep(${i},'description',this.value)">${x(s.description||'')}</textarea>
          </div>
          <div style="flex:0 0 200px">
            <div class="edit-label" style="margin-bottom:3px">Tools</div>
            <input class="edit-input" placeholder="Miro, Confluence, Claude" value="${x(s.tools||'')}" onchange="updateFlowStep(${i},'tools',this.value)">
          </div>
        </div>
      </div>
      ${hasSubsteps ? `
        <div class="substeps-edit-wrap">
          <div class="edit-label" style="margin-bottom:4px;font-size:10px">Substeps</div>
          <div id="flow-substeps-${i}">${renderSubstepsForStep(i, s.substeps||[])}</div>
          <button class="btn btn-sm" style="margin-top:4px" onclick="addSubstep(${i})">+ Add substep</button>
        </div>` : ''}
    </div>`;
  }).join('');
}

function renderSubstepsForStep(fi, substeps) {
  if (!substeps.length) return `<div style="font-size:11px;color:var(--text-faint);padding:2px 0">No substeps</div>`;
  return substeps.map((cs,si) =>
    `<div class="substep-edit-row">
      <span class="substep-edit-n">${si+1}</span>
      <input class="edit-input" placeholder="Substep name" value="${x(cs.name||'')}" onchange="updateSubstep(${fi},${si},'name',this.value)">
      <input class="edit-input" placeholder="Method" value="${x(cs.method||'')}" onchange="updateSubstep(${fi},${si},'method',this.value)">
      <input class="edit-input" placeholder="Tools" value="${x(cs.tools||'')}" onchange="updateSubstep(${fi},${si},'tools',this.value)">
      <select class="edit-select" style="flex:0 0 170px" onchange="updateSubstep(${fi},${si},'aiTask',this.value)">
        <option value="">— No AI task —</option>
        ${(editBuffer.aiTasks||[]).map(t=>`<option value="${x(t.name||'')}"${t.name===cs.aiTask?' selected':''}>${x(t.name||'—')}</option>`).join('')}
      </select>
      <button class="btn btn-sm" onclick="removeSubstep(${fi},${si})">✕</button>
    </div>`
  ).join('');
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
        <input class="edit-input" placeholder="Persona" value="${x(t.persona||'')}" style="flex:0 0 160px" onchange="updateAi(${i},'persona',this.value)">
        <button class="btn btn-sm" onclick="removeAiTask(${i})">✕</button>
      </div>
      <div class="edit-field">
        <div class="edit-label">Objective</div>
        <textarea class="edit-textarea" onchange="updateAi(${i},'objective',this.value)">${x(t.objective||'')}</textarea>
      </div>
      <div class="edit-field">
        <div class="edit-label">Perspectives (multi-agent — one per line, leave empty for single-agent)</div>
        <textarea class="edit-textarea" rows="3" placeholder="End User&#10;Product Owner&#10;Tech Lead" onchange="updateAi(${i},'perspectives',this.value.split('\\n').map(s=>s.trim()).filter(Boolean))">${(t.perspectives||[]).join('\n')}</textarea>
      </div>
      <div class="edit-field" style="margin-bottom:0">
        <div class="edit-label">Prompt</div>
        <textarea class="edit-textarea mono" onchange="updateAi(${i},'prompt',this.value)">${x(t.prompt||'')}</textarea>
      </div>
    </div>`).join('');
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────
function capture() {
  ['title','sub','path','lifecycle','trigger','doel','note','template','diagram'].forEach(id => {
    const el = document.getElementById('ef-'+id);
    if (el) editBuffer[id] = el.value;
  });
  const owner   = document.getElementById('ef-owner');
  const signoff = document.getElementById('ef-signoff');
  const phase   = document.getElementById('ef-phase');
  const parent  = document.getElementById('ef-parent');
  if (owner   && (roles.length > 0 || owner.value   !== '')) editBuffer.owner   = owner.value;
  if (signoff && (roles.length > 0 || signoff.value !== '')) editBuffer.signoff = signoff.value;
  if (phase)  editBuffer.phase  = phase.value;
  if (parent) editBuffer.parent = parent.value;
}

function updateStrItem(f,i,v) { editBuffer[f][i]=v; }
function removeStrItem(f,i) { capture(); editBuffer[f].splice(i,1); document.getElementById('arr-'+f).innerHTML=(f==='reviewers'?renderRoleArr:renderStrArr)(f,editBuffer[f]); }
function addStrItem(f) { capture(); editBuffer[f].push(''); document.getElementById('arr-'+f).innerHTML=renderStrArr(f,editBuffer[f]); }
function addRoleItem(f) { capture(); editBuffer[f].push(''); document.getElementById('arr-'+f).innerHTML=renderRoleArr(f,editBuffer[f]); }

function updateSubstep(fi,si,k,v) {
  if (!editBuffer.flow[fi].substeps) editBuffer.flow[fi].substeps = [];
  editBuffer.flow[fi].substeps[si][k] = v;
}
function removeSubstep(fi,si) {
  capture();
  editBuffer.flow[fi].substeps.splice(si,1);
  document.getElementById('flow-substeps-'+fi).innerHTML = renderSubstepsForStep(fi, editBuffer.flow[fi].substeps||[]);
}
function addSubstep(fi) {
  capture();
  if (!editBuffer.flow[fi].substeps) editBuffer.flow[fi].substeps = [];
  editBuffer.flow[fi].substeps.push({name:'',method:'',tools:'',aiTask:''});
  document.getElementById('flow-substeps-'+fi).innerHTML = renderSubstepsForStep(fi, editBuffer.flow[fi].substeps);
}

function updateFlowStep(i,k,v) { editBuffer.flow[i][k]=v; }
function removeFlowStep(i) { capture(); editBuffer.flow.splice(i,1); document.getElementById('arr-flow').innerHTML=renderFlowArr(editBuffer.flow); }
function addFlowStep() { capture(); editBuffer.flow.push({name:'',sub:'',type:'step',description:'',tools:'',substeps:[]}); document.getElementById('arr-flow').innerHTML=renderFlowArr(editBuffer.flow); }

function updateRef(i,k,v) { editBuffer.refs[i][k]=v; }
function removeRef(i) { capture(); editBuffer.refs.splice(i,1); document.getElementById('arr-refs').innerHTML=renderRefsArr(editBuffer.refs); }
function addRef() { capture(); editBuffer.refs.push({dir:'→',key:''}); document.getElementById('arr-refs').innerHTML=renderRefsArr(editBuffer.refs); }

function updateAi(i,k,v) { editBuffer.aiTasks[i][k]=v; }
function removeAiTask(i) { capture(); editBuffer.aiTasks.splice(i,1); document.getElementById('arr-ai').innerHTML=renderAiArr(editBuffer.aiTasks); }
function addAiTask() { capture(); editBuffer.aiTasks.push({name:'',persona:'',objective:'',prompt:''}); document.getElementById('arr-ai').innerHTML=renderAiArr(editBuffer.aiTasks); }

// ─── Save ─────────────────────────────────────────────────────────────────────
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
