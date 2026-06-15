export function html() {
  return `
<nav class="topnav">
  <div class="nav-logo" id="nav-logo">
    <div class="nav-logo-mark">
      <svg viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="2" fill="#054e5a"/><rect x="3" y="4" width="8" height="1.5" rx=".75" fill="#fff"/><rect x="3" y="7" width="12" height="1.5" rx=".75" fill="#fff"/><rect x="3" y="10" width="10" height="1.5" rx=".75" fill="#fff"/><rect x="3" y="13" width="6" height="1.5" rx=".75" fill="#fff"/></svg>
    </div>
    <div>
      <div class="nav-product">Spec Workbench</div>
      <div class="nav-space">we+</div>
    </div>
  </div>
  <div class="nav-sep"></div>
  <div class="nav-search">
    <svg class="nav-search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/><line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" placeholder="Search files…" id="search-input">
  </div>
  <div class="nav-right">
    <div class="nav-project-switcher">
      <button class="nav-project-btn" id="nav-project-btn">No project</button>
      <button class="nav-btn-icon" id="nav-add-project" title="Manage projects">⊕</button>
    </div>
    <button class="nav-btn-icon" id="github-btn" title="Open GitHub repo" aria-label="Open GitHub repo">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    </button>
    <div class="theme-switcher" id="theme-switcher">
      <button class="nav-btn-icon" id="theme-btn" title="Switch theme" aria-label="Switch theme">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><circle cx="5.5" cy="8" r="1.8" fill="currentColor"/><circle cx="10.5" cy="8" r="1.8" fill="currentColor" opacity=".4"/><circle cx="8" cy="5" r="1.8" fill="currentColor" opacity=".7"/></svg>
      </button>
      <div class="theme-dropdown" id="theme-dropdown"></div>
    </div>
    <div class="nav-avatar">JR</div>
  </div>
</nav>

<div class="float-tag-bar" id="float-tag-bar">
  <span class="fbar-label">Tag</span>
  <button class="tag-btn tag-btn-todo"    onclick="window.__insertTagSel('TODO')">TODO</button>
  <button class="tag-btn tag-btn-review"  onclick="window.__insertTagSel('REVIEW')">REVIEW</button>
  <button class="tag-btn tag-btn-rework"  onclick="window.__insertTagSel('REWORK')">REWORK</button>
  <button class="tag-btn tag-btn-clarify" onclick="window.__insertTagSel('CLARIFY')">CLARIFY</button>
  <button class="tag-btn tag-btn-comment" onclick="window.__insertTagSel('COMMENT')">COMMENT</button>
</div>

<div class="layout">
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-space-name" id="sb-space">No project selected</div>
      <div class="sidebar-title">
        <span id="sb-title">—</span>
        <button id="refresh-btn" title="Refresh" style="background:none;border:none;cursor:pointer;color:var(--muted);font-size:16px;padding:2px 4px">↻</button>
      </div>
    </div>
    <div class="filter-bar">
      <button class="filter-chip active" data-filter="all">All</button>
      <button class="filter-chip" data-filter="modified">Modified<span class="chip-count" id="fc-modified"></span></button>
      <button class="filter-chip" data-filter="tags">Has Tags<span class="chip-count" id="fc-tags"></span></button>
      <button class="filter-chip" data-filter="recent">Recent</button>
    </div>
    <div class="sb-section" id="sb-ai" style="display:none">
      <div class="sb-section-hdr" id="sb-ai-hdr">
        <span class="tag-recipient tag-recipient-ai" style="font-size:8px">AI</span> For AI
        <span class="sb-count empty" id="sb-ai-count">0</span>
        <span class="sb-arrow">▾</span>
      </div>
      <div class="sb-section-body" id="sb-ai-body"></div>
    </div>
    <div class="sb-section" id="sb-human" style="display:none">
      <div class="sb-section-hdr" id="sb-human-hdr">
        <span class="tag-recipient tag-recipient-human" style="font-size:8px">YOU</span> For You
        <span class="sb-count empty" id="sb-human-count">0</span>
        <span class="sb-arrow">▾</span>
      </div>
      <div class="sb-section-body" id="sb-human-body"></div>
    </div>
    <div class="sb-section" id="sb-changes" style="display:none">
      <div class="sb-section-hdr" id="sb-changes-hdr">
        <span>Changes</span>
        <span class="sb-count empty" id="sb-changes-count">0</span>
        <span class="sb-arrow">▾</span>
      </div>
      <div class="sb-section-body" id="sb-changes-body"></div>
    </div>
    <div class="tree" id="tree">
      <div class="empty-state" style="height:200px">
        <svg viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2"/></svg>
        <p>Add a project to start</p>
      </div>
    </div>
  </div>

  <div class="content-wrap">
    <div class="edit-bar" id="edit-bar">
      <span class="edit-bar-label">Editing <span id="edit-bar-path"></span></span>
      <span class="save-status" id="save-status"></span>
      <button class="btn btn-secondary" id="btn-cancel-edit">Cancel</button>
      <button class="btn btn-primary" id="btn-save-edit">Save</button>
    </div>

    <div class="breadcrumb" id="breadcrumb" style="display:none">
      <span class="bc-item link" id="bc-root"></span>
      <span class="bc-sep">›</span>
      <span class="bc-item" id="bc-section"></span>
      <span class="bc-sep" id="bc-sep2">›</span>
      <span class="bc-item" id="bc-file"></span>
    </div>

    <div id="page-view" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
      <div class="page-header" id="page-header" style="display:none">
        <div class="page-meta">
          <span class="page-tag" id="page-tag">Doc</span>
          <span class="page-path" id="page-path"></span>
        </div>
        <div class="page-title-row">
          <div>
            <div class="page-title" id="page-title"></div>
            <div class="page-byline" id="page-byline"></div>
          </div>
          <div class="page-actions" id="page-actions" style="display:none">
            <button class="btn btn-diff hidden" id="btn-diff">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11M1 9h11M4 1v11M9 1v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              Changes
            </button>
            <button class="btn btn-primary" id="btn-edit">
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
              Edit
            </button>
          </div>
        </div>
        <div class="page-divider"></div>
      </div>
      <div class="content-scroll" id="content-scroll">
        <div class="empty-state">
          <svg viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2"/><line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" stroke-width="2"/><line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" stroke-width="2"/><line x1="20" y1="36" x2="36" y2="36" stroke="currentColor" stroke-width="2"/></svg>
          <p>Select a file from the sidebar to view it.</p>
        </div>
      </div>
    </div>

    <div class="wysiwyg-wrap" id="wysiwyg-wrap">
      <div class="tag-toolbar" id="tag-toolbar">
        <span class="tag-toolbar-label">Insert tag</span>
        <button class="tag-btn tag-btn-todo"    id="tb-todo">TODO</button>
        <button class="tag-btn tag-btn-review"  id="tb-review">REVIEW</button>
        <button class="tag-btn tag-btn-rework"  id="tb-rework">REWORK</button>
        <button class="tag-btn tag-btn-clarify" id="tb-clarify">CLARIFY</button>
        <button class="tag-btn tag-btn-comment" id="tb-comment">COMMENT</button>
      </div>
      <div id="wysiwyg-editor"></div>
    </div>
  </div>
</div>

<!-- Project modal -->
<div class="modal-overlay hidden" id="modal-overlay">
  <div class="modal">
    <h2>Projects</h2>
    <ul class="project-list" id="project-list"></ul>
    <hr class="modal-sep">
    <label>Browse to project folder</label>
    <div class="dir-browser" id="dir-browser">
      <div class="dir-browser-path">
        <button id="dir-up" title="Up">↑</button>
        <span id="dir-current-path" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></span>
      </div>
      <div class="dir-browser-list" id="dir-list"></div>
    </div>
    <button class="dir-select-btn" id="dir-select-btn" disabled>Select This Folder</button>
    <label>Display name (optional)</label>
    <input type="text" id="modal-name" placeholder="My Project">
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-add">Add Project</button>
    </div>
  </div>
</div>

<!-- GitHub repo modal -->
<div class="modal-overlay hidden" id="gh-modal-overlay">
  <div class="modal">
    <h2>Open GitHub Repo</h2>
    <label>Repository (URL or owner/repo)</label>
    <input type="text" id="gh-repo-input" placeholder="e.g. anthropics/claude-code">
    <p id="gh-modal-err" style="color:var(--warn);font-size:12px;margin:-8px 0 8px;display:none"></p>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="gh-modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="gh-modal-open">Open</button>
    </div>
  </div>
</div>`;
}
