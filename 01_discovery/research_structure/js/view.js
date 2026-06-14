// Document view rendering

function showDoc(key) {
  activeKey = key; editMode = false; editBuffer = null;
  if (viewMode === 'docs') renderDocList();
  else if (viewMode === 'tree') renderTree();
  const d = documents.find(z => z.key === key);
  if (!d) return;

  // Build maps: flow-step name → aiTasks (fallback), aiTask name → {t,i}
  const _aiByStep = {};
  const _aiTaskByName = {};
  (d.aiTasks||[]).forEach((t,i) => {
    _aiTaskByName[t.name] = {t, i};
    if (t.step) (_aiByStep[t.step] = _aiByStep[t.step] || []).push({t, i});
  });

  const _flow = d.flow || [];
  let _cStep = 0;

  const TYPE_ICON = {trigger:'▷', step:'·', signoff:'✓', output:'◆'};

  const processRows = _flow.map((s, fi) => {
    const isLast = fi === _flow.length - 1;
    // Substep-linked tasks are shown inline; remaining step-linked tasks show at bottom
    const substepLinkedNames = new Set(
      (s.substeps||[]).map(cs => cs.aiTask).filter(Boolean)
    );
    const linked = (_aiByStep[s.name] || []).filter(({t}) => !substepLinkedNames.has(t.name));
    const chips = linked.map(({t,i:ti}) => {
      const isMultiChip = Array.isArray(t.perspectives) && t.perspectives.length > 0;
      const chipIcon = isMultiChip ? '👥' : '🤖';
      return `<span class="flow-ai-chip${isMultiChip?' flow-ai-chip--multi':''}" onclick="toggleAiTask(${ti})" title="${x(t.objective||'')}">${chipIcon} ${x(t.name)}</span>`;
    }).join('');

    let subSteps = '';
    if (s.type === 'step' || s.type === 'signoff') {
      const substeps = s.substeps || [];
      subSteps = substeps.map(cs => {
        const n = ++_cStep;
        const csTask = cs.aiTask ? _aiTaskByName[cs.aiTask] : null;
        const csChip = csTask
          ? (() => {
              const {t, i: ti} = csTask;
              const isM = Array.isArray(t.perspectives) && t.perspectives.length > 0;
              return `<span class="flow-ai-chip${isM?' flow-ai-chip--multi':''}" onclick="toggleAiTask(${ti})" title="${x(t.objective||'')}">${isM?'👥':'🤖'} ${x(t.name)}</span>`;
            })()
          : '';
        return `<div class="ptl-sub-step">
          <span class="ptl-sub-n">${n}</span>
          <span class="ptl-sub-name">${x(cs.name)}</span>
          <span class="ptl-sub-method">${x(cs.method||'')}</span>
          <span class="ptl-sub-tools">${x(cs.tools||'')}</span>
          ${csChip ? `<span class="ptl-sub-chip">${csChip}</span>` : '<span></span>'}
        </div>`;
      }).join('');
    }

    return `<div class="ptl-row${isLast?' ptl-row--last':''}">
      <div class="ptl-rail">
        <div class="ptl-dot ptl-dot--${s.type}">${TYPE_ICON[s.type]||'·'}</div>
        ${!isLast ? '<div class="ptl-line"></div>' : ''}
      </div>
      <div class="ptl-body">
        <div class="ptl-header">
          <span class="ptl-badge ptl-badge--${s.type}">${s.type}</span>
          <span class="ptl-name">${x(s.name)}</span>
          ${s.sub ? `<span class="ptl-sub-label">${x(s.sub)}</span>` : ''}
        </div>
        ${subSteps}
        ${chips ? `<div class="flow-ai-chips" style="margin-top:6px">${chips}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  const processHtml = _flow.length ? `
    <div class="section">
      <div class="section-title">Process</div>
      <div class="ptl">${processRows}</div>
    </div>` : '';

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

  const tasks = d.aiTasks || [];
  const aiHtml = tasks.length ? `
    <div class="section">
      <div class="section-title">AI Tasks / Subagents</div>
      ${tasks.map((t,i) => {
        const isMulti = Array.isArray(t.perspectives) && t.perspectives.length > 0;
        const icon = isMulti ? '👥' : '🤖';
        const perspTags = isMulti
          ? `<div class="ai-persp-row">${t.perspectives.map(p=>`<span class="ai-persp-tag">${x(p)}</span>`).join('<span class="ai-persp-sep">→</span>')}<span class="ai-persp-consensus">→ Common Ground</span></div>`
          : '';
        return `
        <div class="ai-task-card${isMulti?' ai-task-card--multi':''}">
          <div class="ai-task-header" onclick="toggleAiTask(${i})">
            <div class="ai-task-name">${icon} ${x(t.name)}</div>
            <div class="ai-persona-pill">${x(t.persona)}</div>
            <span id="ai-chev-${i}" style="font-size:11px;color:var(--text-faint)">▼</span>
          </div>
          ${perspTags}
          <div class="ai-task-body" id="ai-body-${i}">
            <div class="ai-objective">${x(t.objective)}</div>
            <div class="ai-prompt-label">Prompt</div>
            <div class="ai-prompt-block">${x(t.prompt)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>` : `
    <div class="section">
      <div class="section-title">AI Tasks / Subagents</div>
      <div style="font-size:12px;color:var(--text-faint);font-style:italic">No AI tasks — click Edit to add.</div>
    </div>`;

  const tmplHtml = `
    <div class="section">
      <div class="section-title">Template</div>
      ${(d.template||'').trim()
        ? `<div class="template-block">${x(d.template)}</div>`
        : `<div style="font-size:12px;color:var(--text-faint);font-style:italic">No template — click Edit to add.</div>`}
    </div>`;

  const diagHtml = (d.diagram||'').trim() ? `
    <div class="section">
      <div class="section-title">Diagram</div>
      <div class="mermaid-wrap"><pre class="mermaid">${d.diagram}</pre></div>
    </div>` : '';

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

    ${processHtml}

    ${diagHtml}
    ${refsHtml}
    ${aiHtml}
    ${tmplHtml}
  `;

  if (diagHtml && window.mermaid) {
    setTimeout(() => mermaid.run({ querySelector: '.mermaid' }), 0);
  }
}

function toggleAiTask(i) {
  const body = document.getElementById('ai-body-'+i);
  const chev = document.getElementById('ai-chev-'+i);
  const open = body.classList.toggle('open');
  if (chev) chev.textContent = open ? '▲' : '▼';
  if (open) body.closest('.ai-task-card').scrollIntoView({behavior:'smooth', block:'nearest'});
}
