const FILE_ICONS = {
  md: "📄",
  vtt: "🎙️",
  json: "{ }",
  html: "🌐",
  xlsx: "📊",
  pptx: "📑",
  png: "🖼️",
  jpg: "🖼️",
};

export function buildTreeHTML(nodes, modifiedSet, tagFiles, filter, searchQ) {
  return nodes.map((n) => renderNode(n, modifiedSet, tagFiles, filter, searchQ)).join("");
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

function renderNode(node, modifiedSet, tagFiles, filter, searchQ) {
  if (node.type === "dir") {
    if (!matchesFilter(node, modifiedSet, tagFiles, filter, searchQ)) return "";
    const hasChanges = dirHasModified(node, modifiedSet);
    const children = node.children
      .map((c) => renderNode(c, modifiedSet, tagFiles, filter, searchQ))
      .join("");
    const openAttr = filter !== "all" || searchQ ? " open" : "";
    return `
      <details class="t-dir${hasChanges ? " has-changes" : ""}"${openAttr}>
        <summary>${node.name}</summary>
        <div class="t-children">${children}</div>
      </details>`;
  }

  if (!matchesFilter(node, modifiedSet, tagFiles, filter, searchQ)) return "";
  const icon = FILE_ICONS[node.type] || "📄";
  const isModified = modifiedSet.has(node.path);
  return `
    <div class="t-file${isModified ? " git-modified" : ""}" data-path="${esc(node.path)}" title="${esc(node.path)}">
      <span class="ico">${icon}</span>
      <span class="fname">${esc(node.name)}</span>
      <span class="git-dot" title="Uncommitted changes"></span>
    </div>`;
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
