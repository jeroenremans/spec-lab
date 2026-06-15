import { esc } from "./utils.js";

const FILE_ICONS = {
  md: "📄", vtt: "🎙️", json: "{ }", html: "🌐",
  xlsx: "📊", pptx: "📑", png: "🖼️", jpg: "🖼️",
};

function displayName(raw) {
  return raw.replace(/\.md$/i, "").replace(/[-_]/g, " ");
}

export function buildTreeHTML(nodes, modifiedSet, tagFiles, filter, searchQ, tagCounts) {
  return nodes.map((n) => renderNode(n, modifiedSet, tagFiles, filter, searchQ, tagCounts)).join("");
}

function matchesFilter(node, modifiedSet, tagFiles, filter, searchQ) {
  if (searchQ) {
    if (node.type === "dir") return nodeHasMatch(node, searchQ);
    return node.name.toLowerCase().includes(searchQ.toLowerCase());
  }
  if (filter === "all") return true;
  if (filter === "modified") {
    if (node.type === "dir") return dirHasModified(node, modifiedSet);
    return modifiedSet.has(node.path);
  }
  if (filter === "tags") {
    if (node.type === "dir") return dirHasTags(node, tagFiles);
    return tagFiles.has(node.path);
  }
  if (filter === "recent") return true;
  return true;
}

function nodeHasMatch(dir, q) {
  if (!dir.children) return false;
  return dir.children.some(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.type === "dir" && nodeHasMatch(c, q))
  );
}

function dirHasModified(dir, modifiedSet) {
  if (!dir.children) return false;
  return dir.children.some(
    (c) =>
      (c.type !== "dir" && modifiedSet.has(c.path)) ||
      (c.type === "dir" && dirHasModified(c, modifiedSet))
  );
}

function dirHasTags(dir, tagFiles) {
  if (!dir.children) return false;
  return dir.children.some(
    (c) =>
      (c.type !== "dir" && tagFiles.has(c.path)) ||
      (c.type === "dir" && dirHasTags(c, tagFiles))
  );
}

function renderNode(node, modifiedSet, tagFiles, filter, searchQ, tagCounts) {
  if (node.type === "dir") {
    if (!matchesFilter(node, modifiedSet, tagFiles, filter, searchQ)) return "";
    const hasChanges = dirHasModified(node, modifiedSet);
    const children = node.children
      .map((c) => renderNode(c, modifiedSet, tagFiles, filter, searchQ, tagCounts))
      .join("");
    const openAttr = filter !== "all" || searchQ ? " open" : "";
    return `
      <details class="t-dir${hasChanges ? " has-changes" : ""}"${openAttr} data-dir-path="${esc(node.path)}">
        <summary>
          <span class="t-dir-name">${esc(displayName(node.name))}</span>
          <button class="t-add-btn" data-dir-path="${esc(node.path)}" title="Nieuw bestand">+</button>
        </summary>
        <div class="t-children">${children}</div>
      </details>`;
  }

  if (!matchesFilter(node, modifiedSet, tagFiles, filter, searchQ)) return "";
  const icon = FILE_ICONS[node.type] || "📄";
  const isModified = modifiedSet.has(node.path);
  const tagCount = tagCounts?.get(node.path) || 0;
  const tooltip = tagCount > 0 ? `${node.path} · ${tagCount} tag${tagCount !== 1 ? "s" : ""}` : node.path;
  return `
    <div class="t-file${isModified ? " git-modified" : ""}" data-path="${esc(node.path)}" title="${esc(tooltip)}">
      <span class="ico">${icon}</span>
      <span class="fname">${esc(displayName(node.name))}</span>
      <span class="git-dot" title="Uncommitted changes"></span>
    </div>`;
}
