const BASE = "/api";

export async function getProjects() {
  const r = await fetch(`${BASE}/projects`);
  return r.json();
}

export async function addProject(path, name) {
  const r = await fetch(`${BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, name }),
  });
  return r.json();
}

export async function deleteProject(idx) {
  const r = await fetch(`${BASE}/projects/${idx}`, { method: "DELETE" });
  return r.json();
}

export async function getFiles(projectPath) {
  const r = await fetch(`${BASE}/files?project=${encodeURIComponent(projectPath)}`);
  return r.json();
}

export async function getFileContent(projectPath, fileRel) {
  const r = await fetch(
    `${BASE}/file?project=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(fileRel)}`
  );
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

export async function saveFile(projectPath, fileRel, content) {
  const r = await fetch(
    `${BASE}/file?project=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(fileRel)}`,
    { method: "PUT", headers: { "Content-Type": "text/markdown" }, body: content }
  );
  return r.json();
}

export async function getGitStatus(projectPath) {
  const r = await fetch(`${BASE}/git/status?project=${encodeURIComponent(projectPath)}`);
  return r.json();
}

export async function getGitDiff(projectPath, fileRel) {
  const r = await fetch(
    `${BASE}/git/diff?project=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(fileRel)}`
  );
  return r.json();
}

export async function getGitHeadContent(projectPath, fileRel) {
  const r = await fetch(
    `${BASE}/git/head-content?project=${encodeURIComponent(projectPath)}&file=${encodeURIComponent(fileRel)}`
  );
  return r.json();
}

export async function getGitDiffStat(projectPath) {
  const r = await fetch(`${BASE}/git/diff-stat?project=${encodeURIComponent(projectPath)}`);
  return r.json();
}

export async function browseDir(path) {
  const r = await fetch(`/api/browse?path=${encodeURIComponent(path)}`);
  return r.json();
}

export async function getTags(projectPath) {
  const r = await fetch(`${BASE}/tags?project=${encodeURIComponent(projectPath)}`);
  return r.json();
}
