import { state } from "./state.js";
import { esc } from "./utils.js";
import mermaid from "mermaid";
import { getFileContent, saveFile, getGitHeadContent, getGithubFile } from "./api.js";
import { renderMarkdown, renderVTT, renderJSON, paragraphDiff } from "./render.js";
import { createEditor, destroyEditor, getEditor, isEditing, setupFloatingTagBar } from "./editor.js";

let _afterSave;

export function initViewer({ afterSave }) {
  _afterSave = afterSave;

  // Delegated link handler for relative markdown links (S4.5)
  document.getElementById("content-scroll").addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || /^(https?:|mailto:|#)/.test(href)) return;
    e.preventDefault();
    const resolved = resolveRelPath(state.currentFile, href);
    if (resolved) openFile(resolved);
  });
}

function resolveRelPath(currentFile, href) {
  if (!currentFile) return null;
  const base = currentFile.split("/").slice(0, -1).join("/");
  const joined = base ? base + "/" + href : href;
  const parts = joined.split("/");
  const out = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p && p !== ".") out.push(p);
  }
  return out.join("/");
}

export async function openFile(path) {
  if (!state.activeProject && !state.githubRepo) return;
  if (isEditing()) cancelEdit();
  state.currentFile = path;
  state.inlineDiffActive = false;

  document.querySelectorAll(".t-file").forEach((el) => {
    el.classList.toggle("active", el.dataset.path === path);
  });

  updateBreadcrumb(path);

  const ext = path.split(".").pop().toLowerCase();
  const scroll = document.getElementById("content-scroll");

  try {
    const content = state.githubRepo
      ? await getGithubFile(state.githubRepo, path)
      : await getFileContent(state.activeProject.path, path);

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
      const projPath = state.activeProject?.path || "";
      showContent(`
        <div class="file-info">
          <h2>${esc(fname)}</h2>
          <p>This file type cannot be previewed in the workbench.</p>
          ${projPath ? `<a href="/api/file?project=${encodeURIComponent(projPath)}&file=${encodeURIComponent(path)}" target="_blank" rel="noopener">Open / Download</a>` : ""}
        </div>`);
    }
  } catch (e) {
    scroll.innerHTML = `<p style="color:var(--warn);padding:20px">Could not load file: ${esc(e.message)}</p>`;
  }
}

function renderMdPage(path, md) {
  const isRemote = !!state.githubRepo;
  const isModified = !isRemote && state.modifiedFiles.has(path);
  showPageHeader(path, isRemote ? "Remote" : isModified ? "Modified" : "Doc", isModified);
  document.getElementById("page-actions").style.display = isRemote ? "none" : "flex";

  if (!isRemote) {
    const diffBtn = document.getElementById("btn-diff");
    if (isModified) diffBtn.classList.remove("hidden");
    else diffBtn.classList.add("hidden");
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

  const title = fname.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  document.getElementById("page-title").textContent = title;
  document.getElementById("page-byline").textContent = "";
}

function showContent(htmlStr) {
  const scroll = document.getElementById("content-scroll");
  scroll.innerHTML = htmlStr;
  scroll.scrollTop = 0;
  document.getElementById("page-view").style.display = "flex";
  document.getElementById("wysiwyg-wrap").classList.remove("active");
}

function updateBreadcrumb(path) {
  const bc = document.getElementById("breadcrumb");
  const parts = path.split("/");
  bc.style.display = "flex";
  const rootName = state.activeProject?.name
    || (state.githubRepo ? state.githubRepo.split("/").pop() : "Home");
  document.getElementById("bc-root").textContent = rootName;
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

export async function startEdit() {
  if (state.githubRepo) return;
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

export async function saveEdit() {
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
    await _afterSave();
  } catch (e) {
    statusEl.className = "save-status err";
    statusEl.textContent = "Save failed: " + e.message;
  } finally {
    btn.disabled = false;
  }
}

export function cancelEdit() {
  document.getElementById("edit-bar").classList.remove("active");
  document.getElementById("wysiwyg-wrap").classList.remove("active");
  document.getElementById("tag-toolbar").classList.remove("active");
  document.getElementById("float-tag-bar").classList.remove("visible");
  document.getElementById("save-status").style.display = "none";
  destroyEditor();
  if (state.currentFile) document.getElementById("page-view").style.display = "flex";
}

export async function toggleDiff() {
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
    const htmlStr = diff.map(({ op, val }) => {
      if (op === "equal") {
        const h = renderMarkdown(val).replace(/^<h1[^>]*>[\s\S]*?<\/h1>\s*/i, "");
        return `<div class="diff-block">${h}</div>`;
      }
      const lines = val.split("\n");
      const linesHtml = lines.map((l) => `<div class="diff-line-raw ${op === "add" ? "add" : "del"}">${op === "add" ? "+ " : "- "}${esc(l)}</div>`).join("");
      return `<div class="diff-block ${op === "add" ? "diff-add-block" : "diff-del-block"}">${linesHtml}</div>`;
    }).join("");
    showContent(`<div class="md-body">${htmlStr}</div>`);
    btn.classList.add("diff-on");
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11M1 9h11M4 1v11M9 1v11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg> Changes <small style="font-size:10px">ON</small>`;
  } catch (e) {
    state.inlineDiffActive = false;
    btn.textContent = "Changes";
  }
}
