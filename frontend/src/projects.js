import { state } from "./state.js";
import { esc } from "./utils.js";
import { getProjects, addProject, deleteProject, browseDir } from "./api.js";

let _switchProject;

export function initProjects({ switchProject }) {
  _switchProject = switchProject;
}

export async function loadProjects() {
  state.projects = await getProjects();
}

let _selectedDirPath = null;

export function openProjectModal() {
  renderProjectList();
  _selectedDirPath = null;
  document.getElementById("dir-select-btn").disabled = true;
  document.getElementById("modal-name").value = "";
  document.getElementById("modal-overlay").classList.remove("hidden");
  loadDirBrowser(null);
}

export function closeProjectModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  _selectedDirPath = null;
}

export async function loadDirBrowser(path) {
  const data = await browseDir(path || "~");
  const currentEl = document.getElementById("dir-current-path");
  const listEl = document.getElementById("dir-list");
  const upBtn = document.getElementById("dir-up");
  currentEl.textContent = data.path;
  currentEl.title = data.path;
  upBtn.disabled = !data.parent;
  upBtn.onclick = () => data.parent && loadDirBrowser(data.parent);

  if (data.dirs.length === 0) {
    listEl.innerHTML = `<div class="dir-browser-empty">No subdirectories</div>`;
  } else {
    listEl.innerHTML = data.dirs
      .map((d) => `<div class="dir-browser-item" data-path="${esc(data.path + "/" + d)}">📁 ${esc(d)}</div>`)
      .join("");
    listEl.querySelectorAll(".dir-browser-item").forEach((item) => {
      item.addEventListener("click", () => {
        listEl.querySelectorAll(".dir-browser-item").forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
        _selectedDirPath = item.dataset.path;
        document.getElementById("dir-select-btn").disabled = false;
        if (!document.getElementById("modal-name").value) {
          document.getElementById("modal-name").value = item.dataset.path.split("/").pop();
        }
      });
      item.addEventListener("dblclick", () => loadDirBrowser(item.dataset.path));
    });
  }
  document.getElementById("dir-select-btn").onclick = () => {
    if (_selectedDirPath) {
      document.getElementById("dir-current-path").textContent = _selectedDirPath;
      loadDirBrowser(_selectedDirPath);
    }
  };
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
      _switchProject(state.projects[idx]);
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

export async function handleAddProject() {
  const path = (_selectedDirPath || "").trim();
  const name = document.getElementById("modal-name").value.trim();
  if (!path) { alert("Select a folder first."); return; }
  const result = await addProject(path, name);
  if (!result.ok) { alert(result.error); return; }
  await loadProjects();
  _switchProject(result.project);
  closeProjectModal();
}
