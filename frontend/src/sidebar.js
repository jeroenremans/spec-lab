import { state } from "./state.js";
import { esc } from "./utils.js";
import { buildTreeHTML } from "./tree.js";

let _openFile;
let _onCreateFile;

export function initSidebar({ openFile, onCreateFile }) {
  _openFile = openFile;
  _onCreateFile = onCreateFile;
}

export function updateFilterCounts() {
  document.getElementById("fc-modified").textContent =
    state.modifiedFiles.size > 0 ? ` ${state.modifiedFiles.size}` : "";
  document.getElementById("fc-tags").textContent =
    state.tagFiles.size > 0 ? ` ${state.tagFiles.size}` : "";
}

export function renderTree() {
  const tagCounts = new Map(state.tagData.map((f) => [f.path, f.tags.length]));
  const treeHtml = buildTreeHTML(
    state.tree,
    state.modifiedFiles,
    state.tagFiles,
    state.activeFilter,
    state.searchQ,
    tagCounts
  );
  document.getElementById("tree").innerHTML =
    treeHtml || `<div style="padding:16px;color:var(--muted);font-size:12px">No files match filter.</div>`;

  if (state.currentFile) {
    document.querySelectorAll(".t-file").forEach((el) => {
      el.classList.toggle("active", el.dataset.path === state.currentFile);
    });
  }

  // Restore folder open states
  const treeState = JSON.parse(localStorage.getItem("treeState") || "{}");
  document.querySelectorAll("#tree details[data-dir-path]").forEach((det) => {
    const p = det.dataset.dirPath;
    if (p in treeState) det.open = treeState[p];
    det.addEventListener("toggle", () => {
      const s = JSON.parse(localStorage.getItem("treeState") || "{}");
      s[det.dataset.dirPath] = det.open;
      localStorage.setItem("treeState", JSON.stringify(s));
    });
  });

  // Attach add-btn click handlers
  if (_onCreateFile) {
    document.querySelectorAll(".t-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        _onCreateFile(btn.dataset.dirPath);
      });
    });
  }
}

export function renderTagSection(id, files) {
  const el = document.getElementById(`sb-${id}`);
  const body = document.getElementById(`sb-${id}-body`);
  const count = document.getElementById(`sb-${id}-count`);
  if (files.length === 0) { el.style.display = "none"; return; }
  el.style.display = "";
  count.textContent = files.length;
  count.className = "sb-count";
  body.innerHTML = files.map((f) => {
    const chips = [...new Set(f.tags.map((t) => t.type))]
      .map((t) => `<span class="sb-tag-chip tag-${t.toLowerCase()}">${t}</span>`).join("");
    return `<div class="sb-file-row" data-path="${esc(f.path)}">
        <span class="sb-fname">${esc(f.path.split("/").pop())}</span>
        <span class="sb-stat">${f.tags.length}</span>
      </div>
      <div class="sb-tag-chips">${chips}</div>`;
  }).join("");
  body.querySelectorAll(".sb-file-row").forEach((row) => {
    row.addEventListener("click", () => _openFile(row.dataset.path));
  });
}

export function renderSidebarSections() {
  const aiFiles = state.tagData
    .map((f) => ({ ...f, tags: f.tags.filter((t) => (t.recipient || "AI") === "AI") }))
    .filter((f) => f.tags.length > 0);
  const humanFiles = state.tagData
    .map((f) => ({ ...f, tags: f.tags.filter((t) => t.recipient === "HUMAN") }))
    .filter((f) => f.tags.length > 0);

  renderTagSection("ai", aiFiles);
  renderTagSection("human", humanFiles);

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
      row.addEventListener("click", () => _openFile(row.dataset.path));
    });
  } else {
    changesEl.style.display = "none";
  }

  const savedSections = JSON.parse(localStorage.getItem("sbSections") || "{}");
  ["ai", "human", "changes"].forEach((id) => {
    if (savedSections[id]) {
      const section = document.getElementById(`sb-${id}`);
      if (section.style.display !== "none") {
        document.getElementById(`sb-${id}-hdr`).classList.add("open");
        document.getElementById(`sb-${id}-body`).classList.add("open");
      }
    }
  });
}

export function setFilter(filter) {
  state.activeFilter = filter;
  document.querySelectorAll(".filter-chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.filter === filter);
  });
  renderTree();
}

export function toggleSbSection(id) {
  const hdr = document.getElementById(`sb-${id}-hdr`);
  const body = document.getElementById(`sb-${id}-body`);
  hdr.classList.toggle("open");
  body.classList.toggle("open");
  const saved = JSON.parse(localStorage.getItem("sbSections") || "{}");
  saved[id] = hdr.classList.contains("open");
  localStorage.setItem("sbSections", JSON.stringify(saved));
}
