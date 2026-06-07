import "./style.css";
import mermaid from "mermaid";
import { getFiles, getGitStatus, getGitDiffStat, getTags } from "./api.js";
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
initSidebar({ openFile });
initViewer({ afterSave: refreshAll });
attachListeners();
loadProjects().then(() => {
  const lastPath = localStorage.getItem("lastProjectPath");
  const last = state.projects.find((p) => p.path === lastPath);
  const initial = last || state.projects[0];
  if (initial) switchProject(initial);
});

async function switchProject(project) {
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

  window.addEventListener("beforeunload", (e) => {
    const ed = getEditor();
    if (isEditing() && ed && ed.value() !== state.originalContent) {
      e.preventDefault(); e.returnValue = "";
    }
  });
}
