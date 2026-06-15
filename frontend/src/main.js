import "./style.css";
import mermaid from "mermaid";
import { getFiles, getGitStatus, getGitDiffStat, getTags, createItem, getGithubTree } from "./api.js";
import { state } from "./state.js";
import { html } from "./html.js";
import { openThemeDropdown, closeThemeDropdown } from "./theme.js";
import { initProjects, loadProjects, openProjectModal, closeProjectModal, handleAddProject } from "./projects.js";
import { initSidebar, renderTree, renderSidebarSections, updateFilterCounts, setFilter, toggleSbSection } from "./sidebar.js";
import { initViewer, openFile, startEdit, saveEdit, cancelEdit, toggleDiff } from "./viewer.js";
import { isEditing, getEditor, insertTag, insertTagAroundSelection } from "./editor.js";

mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });

document.getElementById("app").innerHTML = html();
initProjects({ switchProject });
initSidebar({ openFile, onCreateFile: handleCreateFile });
initViewer({ afterSave: refreshAll });
attachListeners();
loadProjects().then(() => {
  const lastPath = localStorage.getItem("lastProjectPath");
  const last = state.projects.find((p) => p.path === lastPath);
  const initial = last || state.projects[0];
  if (initial) switchProject(initial);
});

// ── Local project ─────────────────────────────────────────────────────────

async function switchProject(project) {
  state.githubRepo = null;
  state.activeProject = project;
  localStorage.setItem("lastProjectPath", project.path);
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

// ── Create file (S5.4 + S5.5) ─────────────────────────────────────────────

async function handleCreateFile(dirPath) {
  const raw = window.prompt("Bestandsnaam (.md automatisch toegevoegd):");
  if (!raw) return;
  const name = raw.trim().replace(/\.md$/i, "");
  if (!/^[a-zA-Z0-9_\-]+$/.test(name)) {
    alert("Naam mag alleen letters, cijfers, _ en - bevatten.");
    return;
  }
  const filePath = (dirPath ? dirPath + "/" : "") + name + ".md";
  const result = await createItem(state.activeProject.path, filePath, false);
  if (!result.ok) { alert(result.error); return; }
  await refreshAll();
  openFile(filePath);
}

// ── GitHub repo (EP9) ────────────────────────────────────────────────────

function parseGithubRepo(input) {
  const clean = input.trim();
  const urlMatch = clean.match(/github\.com\/([^/]+\/[^/\s?#]+)/);
  if (urlMatch) return urlMatch[1].replace(/\.git$/, "");
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(clean)) return clean;
  return null;
}

function flatToTree(items) {
  const READABLE = new Set(["md", "html", "json", "txt", "vtt", "yml", "yaml", "js", "ts", "jsx", "tsx", "py", "sh", "css", "xml"]);
  const dirMap = new Map();
  const root = [];

  function ensureDir(path) {
    if (dirMap.has(path)) return dirMap.get(path);
    const name = path.split("/").pop();
    const node = { name, path, type: "dir", children: [] };
    dirMap.set(path, node);
    const parentPath = path.split("/").slice(0, -1).join("/");
    if (parentPath) {
      const parent = ensureDir(parentPath);
      if (!parent.children.find((c) => c.path === path)) parent.children.push(node);
    } else {
      if (!root.find((c) => c.path === path)) root.push(node);
    }
    return node;
  }

  for (const item of items) {
    if (item.type !== "file" && item.type !== "blob") continue;
    const name = item.path.split("/").pop();
    const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
    if (ext && !READABLE.has(ext)) continue;
    const fileNode = { name, path: item.path, type: ext || "file" };
    const parentPath = item.path.split("/").slice(0, -1).join("/");
    if (parentPath) {
      const parent = ensureDir(parentPath);
      parent.children.push(fileNode);
    } else {
      root.push(fileNode);
    }
  }

  function sortNodes(nodes) {
    nodes.sort((a, b) => {
      const ad = a.type === "dir" ? 0 : 1;
      const bd = b.type === "dir" ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => { if (n.type === "dir") sortNodes(n.children); });
  }
  sortNodes(root);
  return root;
}

async function openGithubRepo(repo) {
  const btn = document.getElementById("gh-modal-open");
  const errEl = document.getElementById("gh-modal-err");
  errEl.style.display = "none";
  btn.disabled = true;
  btn.textContent = "Loading…";
  try {
    const data = await getGithubTree(repo);
    if (data.error) throw new Error(data.error);
    state.githubRepo = repo;
    state.activeProject = null;
    state.currentFile = null;
    state.tree = flatToTree(data.items || []);
    state.modifiedFiles = new Set();
    state.diffStatFiles = {};
    state.tagData = [];
    state.tagFiles = new Set();

    document.getElementById("nav-project-btn").textContent = repo.split("/").pop();
    document.getElementById("sb-space").textContent = "GitHub · Read-only";
    document.getElementById("sb-title").textContent = repo;
    document.getElementById("page-header").style.display = "none";
    document.getElementById("breadcrumb").style.display = "none";
    document.getElementById("content-scroll").innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 64 64" fill="none"><rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" stroke-width="2"/></svg>
        <p>Select a file to view it. Read-only.</p>
      </div>`;

    updateFilterCounts();
    renderTree();

    closeGhModal();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
  } finally {
    btn.disabled = false;
    btn.textContent = "Open";
  }
}

function closeGhModal() {
  document.getElementById("gh-modal-overlay").classList.add("hidden");
  document.getElementById("gh-repo-input").value = "";
  document.getElementById("gh-modal-err").style.display = "none";
}

// ── Listeners ─────────────────────────────────────────────────────────────

function attachListeners() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[id='nav-add-project'], [id='nav-project-btn']");
    if (btn) openProjectModal();
  });
  document.getElementById("app").addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") closeProjectModal();
    if (e.target.id === "modal-cancel") closeProjectModal();
    if (e.target.id === "modal-add") handleAddProject();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => setFilter(chip.dataset.filter));
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    state.searchQ = e.target.value.trim();
    renderTree();
  });

  document.getElementById("tree").addEventListener("click", (e) => {
    const file = e.target.closest(".t-file");
    if (file) openFile(file.dataset.path);
  });

  document.getElementById("sb-ai-hdr").addEventListener("click", () => toggleSbSection("ai"));
  document.getElementById("sb-human-hdr").addEventListener("click", () => toggleSbSection("human"));
  document.getElementById("sb-changes-hdr").addEventListener("click", () => toggleSbSection("changes"));

  document.getElementById("refresh-btn").addEventListener("click", () => refreshAll());

  document.getElementById("btn-edit").addEventListener("click", startEdit);
  document.getElementById("btn-diff").addEventListener("click", toggleDiff);
  document.getElementById("btn-cancel-edit").addEventListener("click", cancelEdit);
  document.getElementById("btn-save-edit").addEventListener("click", saveEdit);

  ["todo", "review", "rework", "clarify", "comment"].forEach((t) => {
    document.getElementById(`tb-${t}`).addEventListener("click", () =>
      insertTag(t.toUpperCase())
    );
  });

  window.__insertTagSel = (tag) => insertTagAroundSelection(tag);

  document.getElementById("theme-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("theme-dropdown");
    if (dd.classList.contains("open")) closeThemeDropdown();
    else openThemeDropdown();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#theme-switcher")) closeThemeDropdown();
  });

  // GitHub modal
  document.getElementById("github-btn").addEventListener("click", () => {
    document.getElementById("gh-modal-overlay").classList.remove("hidden");
    document.getElementById("gh-repo-input").focus();
  });
  document.getElementById("gh-modal-cancel").addEventListener("click", closeGhModal);
  document.getElementById("gh-modal-overlay").addEventListener("click", (e) => {
    if (e.target.id === "gh-modal-overlay") closeGhModal();
  });
  document.getElementById("gh-modal-open").addEventListener("click", () => {
    const repo = parseGithubRepo(document.getElementById("gh-repo-input").value);
    if (!repo) {
      const errEl = document.getElementById("gh-modal-err");
      errEl.textContent = "Ongeldige repo. Gebruik owner/repo of een GitHub URL.";
      errEl.style.display = "";
      return;
    }
    openGithubRepo(repo);
  });
  document.getElementById("gh-repo-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("gh-modal-open").click();
  });

  window.addEventListener("beforeunload", (e) => {
    const ed = getEditor();
    if (isEditing() && ed && ed.value() !== state.originalContent) {
      e.preventDefault(); e.returnValue = "";
    }
  });
}
