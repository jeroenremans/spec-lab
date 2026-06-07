import "./style.css";
import mermaid from "mermaid";
import {
  getProjects, addProject, deleteProject,
  getFiles, getFileContent, saveFile,
  getGitStatus, getGitDiffStat, getGitHeadContent,
  getTags,
} from "./api.js";
import { buildTreeHTML } from "./tree.js";
import {
  renderMarkdown, renderVTT, renderJSON, paragraphDiff,
} from "./render.js";
import {
  createEditor, destroyEditor, getEditor, isEditing,
  insertTag, insertTagAroundSelection, setupFloatingTagBar,
} from "./editor.js";

mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });

// ── State ─────────────────────────────────────────────────────────────────
let state = {
  projects: [],
  activeProject: null,       // { path, name }
  tree: [],
  modifiedFiles: new Set(),
  tagFiles: new Set(),       // paths that have tags
  tagData: [],               // [{path, tags}]
  diffStatFiles: {},
  currentFile: null,
  originalContent: "",
  currentMdContent: "",
  inlineDiffActive: false,
  activeFilter: "all",
  searchQ: "",
};

// ── Init ──────────────────────────────────────────────────────────────────
document.getElementById("app").innerHTML = html();
attachListeners();
loadProjects().then(() => {
  if (state.projects.length > 0) {
    switchProject(state.projects[0]);
  }
});

function html() {
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
    <div class="sb-section" id="sb-review" style="display:none">
      <div class="sb-section-hdr" id="sb-review-hdr">
        <span>To Review</span>
        <span class="sb-count empty" id="sb-review-count">0</span>
        <span class="sb-arrow">▾</span>
      </div>
      <div class="sb-section-body" id="sb-review-body"></div>
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
    <label>Add project path</label>
    <input type="text" id="modal-path" placeholder="/Users/you/my-spec-repo">
    <label>Display name (optional)</label>
    <input type="text" id="modal-name" placeholder="My Project">
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-add">Add Project</button>
    </div>
  </div>
</div>`;
}

// ── Attach listeners ───────────────────────────────────────────────────────

function attachListeners() {
  // Project modal
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[id='nav-add-project'], [id='nav-project-btn']");
    if (btn) openProjectModal();
  });
  document.getElementById("app").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeProjectModal();
    if (e.target.id === "modal-cancel") closeProjectModal();
    if (e.target.id === "modal-add") handleAddProject();
  });

  // Filter chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });

  // Search
  document.getElementById("search-input").addEventListener("input", (e) => {
    state.searchQ = e.target.value.trim();
    renderTree();
  });

  // Tree file clicks
  document.getElementById("tree").addEventListener("click", (e) => {
    const file = e.target.closest(".t-file");
    if (file) openFile(file.dataset.path);
  });

  // Sidebar section toggles
  document.getElementById("sb-review-hdr").addEventListener("click", () => toggleSbSection("review"));
  document.getElementById("sb-changes-hdr").addEventListener("click", () => toggleSbSection("changes"));

  // Refresh
  document.getElementById("refresh-btn").addEventListener("click", () => refreshAll());

  // Page actions
  document.getElementById("btn-edit").addEventListener("click", startEdit);
  document.getElementById("btn-diff").addEventListener("click", toggleDiff);
  document.getElementById("btn-cancel-edit").addEventListener("click", cancelEdit);
  document.getElementById("btn-save-edit").addEventListener("click", saveEdit);

  // Tag toolbar
  ["todo", "review", "rework", "clarify", "comment"].forEach((t) => {
    document.getElementById(`tb-${t}`).addEventListener("click", () =>
      insertTag(t.toUpperCase())
    );
  });

  // Float tag bar global handler
  window.__insertTagSel = (tag) => insertTagAroundSelection(tag);

  // Warn on unsaved changes
  window.addEventListener("beforeunload", (e) => {
    const ed = getEditor();
    if (isEditing() && ed && ed.value() !== state.originalContent) {
      e.preventDefault(); e.returnValue = "";
    }
  });
}

// ── Projects ───────────────────────────────────────────────────────────────

async function loadProjects() {
  state.projects = await getProjects();
}

function openProjectModal() {
  renderProjectList();
  document.getElementById("modal-overlay").classList.remove("hidden");
  document.getElementById("modal-path").focus();
}

function closeProjectModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  document.getElementById("modal-path").value = "";
  document.getElementById("modal-name").value = "";
}

function renderProjectList() {
  const ul = document.getElementById("project-list");
  if (state.projects.length === 0) {
    ul.innerHTML = `<li style="color:var(--muted);font-size:12px">No projects yet.</li>`;
    return;
  }
  ul.innerHTML = state.projects
    .map(
      (p, i) => `
    <li class="${state.activeProject?.path === p.path ? "active-proj" : ""}" data-idx="${i}">
      <span class="proj-name">${esc(p.name)}</span>
      <span class="proj-path" title="${esc(p.path)}">${esc(p.path)}</span>
      <button class="proj-del" data-del="${i}" title="Remove">×</button>
    </li>`
    )
    .join("");
  ul.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", (e) => {
      if (e.target.dataset.del !== undefined) return;
      const idx = parseInt(li.dataset.idx);
      switchProject(state.projects[idx]);
      closeProjectModal();
    });
  });
  ul.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.del);
      await deleteProject(idx);
      await loadProjects();
      if (state.activeProject?.path === state.projects[idx]?.path) {
        state.activeProject = state.projects[0] || null;
      }
      renderProjectList();
    });
  });
}

async function handleAddProject() {
  const path = document.getElementById("modal-path").value.trim();
  const name = document.getElementById("modal-name").value.trim();
  if (!path) return;
  const result = await addProject(path, name);
  if (!result.ok) { alert(result.error); return; }
  await loadProjects();
  switchProject(result.project);
  closeProjectModal();
}

async function switchProject(project) {
  state.activeProject = project;
  state.currentFile = null;
  state.tree = [];
  document.getElementById("nav-project-btn").textContent = project.name;
  document.getElementById("sb-space").textContent = "we+ · Spec Workbench";
  document.getElementById("sb-title").textContent = project.name;
  document.getElementById("page-header").style.display = "none";
  document.getElementById("breadcrumb").style.display = "none";
  document.getElementById("content-scroll").innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2"/></svg>
      <p>Select a file from the sidebar to view it.</p>
    </div>`;
  await refreshAll();
}

// ── Tree / data ────────────────────────────────────────────────────────────

async function refreshAll() {
  if (!state.activeProject) return;
  const p = state.activeProject.path;
  const [filesRes, gitRes, statRes, tagsRes] = await Promise.all([
    getFiles(p),
    getGitStatus(p),
    getGitDiffStat(p),
    getTags(p),
  ]);
  state.tree = filesRes.tree || [];
  state.modifiedFiles = new Set(gitRes.modified || []);
  state.diffStatFiles = statRes.files || {};
  state.tagData = tagsRes.files || [];
  state.tagFiles = new Set(state.tagData.map((f) => f.path));

  updateFilterCounts();
  renderTree();
  renderSidebarSections();
}

function updateFilterCounts() {
  document.getElementById("fc-modified").textContent =
    state.modifiedFiles.size > 0 ? ` ${state.modifiedFiles.size}` : "";
  document.getElementById("fc-tags").textContent =
    state.tagFiles.size > 0 ? ` ${state.tagFiles.size}` : "";
}

function renderTree() {
  const html = buildTreeHTML(
    state.tree,
    state.modifiedFiles,
    state.tagFiles,
    state.activeFilter,
    state.searchQ
  );
  document.getElementById("tree").innerHTML =
    html || `<div style="padding:16px;color:var(--muted);font-size:12px">No files match filter.</div>`;

  // Mark active
  if (state.currentFile) {
    document.querySelectorAll(".t-file").forEach((el) => {
      el.classList.toggle("active", el.dataset.path === state.currentFile);
    });
  }
}

function renderSidebarSections() {
  // To Review
  const reviewEl = document.getElementById("sb-review");
  const reviewBody = document.getElementById("sb-review-body");
  const reviewCount = document.getElementById("sb-review-count");
  if (state.tagData.length > 0) {
    reviewEl.style.display = "";
    reviewCount.textContent = state.tagFiles.size;
    reviewCount.className = "sb-count";
    reviewBody.innerHTML = state.tagData
      .map((f) => {
        const chips = [...new Set(f.tags.map((t) => t.type))]
          .map((t) => `<span class="sb-tag-chip tag-${t.toLowerCase()}">${t}</span>`)
          .join("");
        return `
          <div class="sb-file-row" data-path="${esc(f.path)}">
            <span class="sb-fname">${esc(f.path.split("/").pop())}</span>
            <span class="sb-stat">${f.tags.length}</span>
          </div>
          <div class="sb-tag-chips">${chips}</div>`;
      })
      .join("");
    reviewBody.querySelectorAll(".sb-file-row").forEach((row) => {
      row.addEventListener("click", () => openFile(row.dataset.path));
    });
  } else {
    reviewEl.style.display = "none";
  }

  // Changes
  const changesEl = document.getElementById("sb-changes");
  const changesBody = document.getElementById("sb-changes-body");
  const changesCount = document.getElementById("sb-changes-count");
  const changedFiles = Object.entries(state.diffStatFiles).filter(([p]) => p.endsWith(".md"));
  if (changedFiles.length > 0) {
    changesEl.style.display = "";
    changesCount.textContent = changedFiles.length;
    changesCount.className = "sb-count";
    changesBody.innerHTML = changedFiles
      .map(([path, stat]) => {
        const label = stat.new
          ? `<span style="color:var(--good);font-size:10px">new</span>`
          : `<span class="sb-stat">+${stat.added} -${stat.deleted}</span>`;
        return `<div class="sb-file-row" data-path="${esc(path)}">
          <span class="sb-fname">${esc(path.split("/").pop())}</span>
          ${label}
        </div>`;
      })
      .join("");
    changesBody.querySelectorAll(".sb-file-row").forEach((row) => {
      row.addEventListener("click", () => openFile(row.dataset.path));
    });
  } else {
    changesEl.style.display = "none";
  }
}

// ── Filters ────────────────────────────────────────────────────────────────

function setFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll(".filter-chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.filter === filter);
  });
  renderTree();
}

function toggleSbSection(id) {
  const hdr = document.getElementById(`sb-${id}-hdr`);
  const body = document.getElementById(`sb-${id}-body`);
  hdr.classList.toggle("open");
  body.classList.toggle("open");
}

// ── File open ──────────────────────────────────────────────────────────────

async function openFile(path) {
  if (!state.activeProject) return;
  if (isEditing()) cancelEdit();
  state.currentFile = path;
  state.inlineDiffActive = false;

  // Mark active in tree
  document.querySelectorAll(".t-file").forEach((el) => {
    el.classList.toggle("active", el.dataset.path === path);
  });

  updateBreadcrumb(path);

  const ext = path.split(".").pop().toLowerCase();
  const scroll = document.getElementById("content-scroll");

  try {
    const content = await getFileContent(state.activeProject.path, path);

    if (ext === "md") {
      state.currentMdContent = content;
      state.originalContent = content;
      renderMdPage(path, content);
    } else if (ext === "vtt") {
      showPageHeader(path, "Transcript");
      document.getElementById("page-actions").style.display = "none";
      showContent(renderVTT(content));
    } else if (ext === "json") {
      showPageHeader(path, "JSON");
      document.getElementById("page-actions").style.display = "none";
      showContent(renderJSON(content));
    } else {
      showPageHeader(path, ext.toUpperCase());
      document.getElementById("page-actions").style.display = "none";
      const fname = path.split("/").pop();
      showContent(`
        <div class="file-info">
          <h2>${esc(fname)}</h2>
          <p>This file type cannot be previewed in the workbench.</p>
          <a href="/api/file?project=${encodeURIComponent(state.activeProject.path)}&file=${encodeURIComponent(path)}" target="_blank" rel="noopener">Open / Download</a>
        </div>`);
    }
  } catch (e) {
    scroll.innerHTML = `<p style="color:var(--warn);padding:20px">Could not load file: ${esc(e.message)}</p>`;
  }
}

function renderMdPage(path, md) {
  const isModified = state.modifiedFiles.has(path);
  showPageHeader(path, isModified ? "Modified" : "Doc", isModified);
  document.getElementById("page-actions").style.display = "flex";

  const diffBtn = document.getElementById("btn-diff");
  if (isModified) {
    diffBtn.classList.remove("hidden");
  } else {
    diffBtn.classList.add("hidden");
  }

  const rendered = renderMarkdown(md).replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  showContent(`<div class="md-body">${rendered}</div>`);
  renderMermaid();
}

function showPageHeader(path, tagLabel, isDraft = false) {
  const parts = path.split("/");
  const fname = parts.pop();
  document.getElementById("page-header").style.display = "";
  document.getElementById("page-tag").textContent = tagLabel;
  document.getElementById("page-tag").className = `page-tag${isDraft ? " draft" : ""}`;
  document.getElementById("page-path").textContent = path;

  // Extract title from filename
  const title = fname.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  document.getElementById("page-title").textContent = title;
  document.getElementById("page-byline").textContent = "";
}

function showContent(html) {
  const scroll = document.getElementById("content-scroll");
  scroll.innerHTML = html;
  scroll.scrollTop = 0;
  document.getElementById("page-view").style.display = "flex";
  document.getElementById("wysiwyg-wrap").classList.remove("active");
}

function updateBreadcrumb(path) {
  const bc = document.getElementById("breadcrumb");
  const parts = path.split("/");
  bc.style.display = "flex";
  document.getElementById("bc-root").textContent = state.activeProject?.name || "Home";
  if (parts.length > 1) {
    document.getElementById("bc-section").textContent = parts.slice(0, -1).join(" › ");
    document.getElementById("bc-sep2").style.display = "";
    document.getElementById("bc-file").textContent = parts[parts.length - 1];
  } else {
    document.getElementById("bc-section").textContent = parts[0];
    document.getElementById("bc-sep2").style.display = "none";
    document.getElementById("bc-file").textContent = "";
  }
}

// ── Mermaid ────────────────────────────────────────────────────────────────

async function renderMermaid() {
  const nodes = document.querySelectorAll("code.language-mermaid");
  for (const node of nodes) {
    const pre = node.parentElement;
    const code = node.textContent;
    try {
      const id = "mermaid-" + Math.random().toString(36).slice(2);
      const { svg } = await mermaid.render(id, code);
      const div = document.createElement("div");
      div.className = "mermaid";
      div.innerHTML = svg;
      pre.replaceWith(div);
    } catch (_) {}
  }
}

// ── Edit ───────────────────────────────────────────────────────────────────

async function startEdit() {
  if (!state.currentFile || !state.currentFile.endsWith(".md")) return;
  state.originalContent = state.currentMdContent;

  document.getElementById("edit-bar-path").textContent = state.currentFile;
  document.getElementById("edit-bar").classList.add("active");
  document.getElementById("wysiwyg-wrap").classList.add("active");
  document.getElementById("tag-toolbar").classList.add("active");
  document.getElementById("page-view").style.display = "none";

  const editor = createEditor(state.originalContent);
  setupFloatingTagBar(editor);
}

async function saveEdit() {
  const editor = getEditor();
  if (!editor) return;
  const content = editor.value();
  const btn = document.getElementById("btn-save-edit");
  const statusEl = document.getElementById("save-status");
  btn.disabled = true;
  statusEl.style.display = "inline";
  statusEl.className = "save-status";
  statusEl.textContent = "Saving…";
  try {
    const result = await saveFile(state.activeProject.path, state.currentFile, content);
    if (!result.ok) throw new Error(result.error || "Save failed");
    state.originalContent = content;
    state.currentMdContent = content;
    statusEl.textContent = "Saved ✓";
    setTimeout(() => { statusEl.style.display = "none"; }, 2500);
    cancelEdit();
    renderMdPage(state.currentFile, content);
    // Refresh git status
    const [gitRes, statRes, tagsRes] = await Promise.all([
      getGitStatus(state.activeProject.path),
      getGitDiffStat(state.activeProject.path),
      getTags(state.activeProject.path),
    ]);
    state.modifiedFiles = new Set(gitRes.modified || []);
    state.diffStatFiles = statRes.files || {};
    state.tagData = tagsRes.files || [];
    state.tagFiles = new Set(state.tagData.map((f) => f.path));
    updateFilterCounts();
    renderTree();
    renderSidebarSections();
  } catch (e) {
    statusEl.className = "save-status err";
    statusEl.textContent = "Save failed: " + e.message;
  } finally {
    btn.disabled = false;
  }
}

function cancelEdit() {
  document.getElementById("edit-bar").classList.remove("active");
  document.getElementById("wysiwyg-wrap").classList.remove("active");
  document.getElementById("tag-toolbar").classList.remove("active");
  document.getElementById("float-tag-bar").classList.remove("visible");
  document.getElementById("save-status").style.display = "none";
  destroyEditor();
  if (state.currentFile) document.getElementById("page-view").style.display = "flex";
}

// ── Diff ───────────────────────────────────────────────────────────────────

async function toggleDiff() {
  const btn = document.getElementById("btn-diff");
  state.inlineDiffActive = !state.inlineDiffActive;
  if (!state.inlineDiffActive) {
    const rendered = renderMarkdown(state.currentMdContent).replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
    showContent(`<div class="md-body">${rendered}</div>`);
    renderMermaid();
    btn.classList.remove("diff-on");
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11M1 9h11M4 1v11M9 1v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Changes`;
    return;
  }
  btn.textContent = "Loading…";
  try {
    const { content: oldMd, error } = await getGitHeadContent(state.activeProject.path, state.currentFile);
    if (error || !oldMd) { state.inlineDiffActive = false; btn.textContent = "Changes"; return; }
    const diff = paragraphDiff(oldMd, state.currentMdContent);
    const html = diff.map(({ op, val }) => {
      if (op === "equal") {
        const h = renderMarkdown(val).replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
        return `<div class="diff-block">${h}</div>`;
      }
      const lines = val.split("\n");
      const linesHtml = lines.map((l) => `<div class="diff-line-raw ${op === "add" ? "add" : "del"}">${op === "add" ? "+ " : "- "}${esc(l)}</div>`).join("");
      return `<div class="diff-block ${op === "add" ? "diff-add-block" : "diff-del-block"}">${linesHtml}</div>`;
    }).join("");
    showContent(`<div class="md-body">${html}</div>`);
    btn.classList.add("diff-on");
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11M1 9h11M4 1v11M9 1v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Changes <small style="font-size:10px">ON</small>`;
  } catch (e) {
    state.inlineDiffActive = false;
    btn.textContent = "Changes";
  }
}

// ── Util ───────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
