import json
import mimetypes
import os
import re
import subprocess
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=None)

ROOT = Path(__file__).parent.parent.resolve()
DIST = ROOT / "frontend" / "dist"
CONFIG_FILE = ROOT / "app" / "projects.json"

INCLUDE_EXTS = {".md", ".html", ".xlsx", ".pptx", ".png", ".jpg", ".vtt", ".json"}
EXCLUDE_DIRS = {
    "node_modules", ".git", "__pycache__", "docs-preview", ".claude",
    "chrome_extension", "chrome_extension_ng", "pim-dashboard", "dist", "app", "frontend",
    ".idea", ".venv", "venv",
}
EXCLUDE_FILES = {"files.json", "_sidebar.md", "package.json", "tsconfig.json", "angular.json"}

TAG_RE = re.compile(r"\[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)(?:\|(AI|HUMAN))?\]([^\n]*)")
_CODE_SPAN_RE = re.compile(r"`[^`\n]+`")
_FENCE_RE = re.compile(r"^\s*```")


# ── Project registry ───────────────────────────────────────────────────────

def load_projects() -> list[dict]:
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text())
        except Exception:
            pass
    return []


def save_projects(projects: list[dict]) -> None:
    CONFIG_FILE.write_text(json.dumps(projects, indent=2))


# ── File tree ─────────────────────────────────────────────────────────────

def build_tree(base: Path, rel: str = "") -> list[dict]:
    try:
        entries = sorted(base.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower()))
    except PermissionError:
        return []
    children = []
    for e in entries:
        if e.name.startswith("."):
            continue
        if e.is_dir():
            if e.name in EXCLUDE_DIRS:
                continue
            sub_rel = f"{rel}/{e.name}" if rel else e.name
            sub = build_tree(e, sub_rel)
            if sub:
                children.append({"name": e.name, "path": sub_rel, "type": "dir", "children": sub})
        else:
            ext = e.suffix.lower()
            if ext not in INCLUDE_EXTS or e.name in EXCLUDE_FILES:
                continue
            frel = f"{rel}/{e.name}" if rel else e.name
            children.append({"name": e.name, "path": frel, "type": ext.lstrip(".")})
    return children


def resolve_project_path(project_path: str) -> Path | None:
    p = Path(project_path).resolve()
    if not p.is_dir():
        return None
    return p


def resolve_file(project_path: str, file_rel: str) -> Path | None:
    base = resolve_project_path(project_path)
    if base is None:
        return None
    p = (base / file_rel).resolve()
    if not str(p).startswith(str(base)):
        return None  # path traversal guard
    return p


# ── Project API ───────────────────────────────────────────────────────────

@app.route("/api/projects", methods=["GET"])
def get_projects():
    return jsonify(load_projects())


@app.route("/api/projects", methods=["POST"])
def add_project():
    data = request.get_json(force=True)
    path = data.get("path", "").strip()
    name = data.get("name", "").strip()
    if not path:
        return jsonify({"ok": False, "error": "path required"}), 400
    resolved = resolve_project_path(path)
    if resolved is None:
        return jsonify({"ok": False, "error": "directory not found"}), 400
    projects = load_projects()
    # Avoid duplicates
    for p in projects:
        if p["path"] == str(resolved):
            return jsonify({"ok": True, "project": p})
    project = {"path": str(resolved), "name": name or resolved.name}
    projects.insert(0, project)
    save_projects(projects)
    return jsonify({"ok": True, "project": project})


@app.route("/api/projects/<int:idx>", methods=["DELETE"])
def delete_project(idx: int):
    projects = load_projects()
    if idx < 0 or idx >= len(projects):
        return jsonify({"ok": False, "error": "not found"}), 404
    projects.pop(idx)
    save_projects(projects)
    return jsonify({"ok": True})


# ── File tree API ─────────────────────────────────────────────────────────

@app.route("/api/files")
def get_files():
    project_path = request.args.get("project", "")
    if not project_path:
        return jsonify({"error": "project required"}), 400
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"error": "project not found"}), 404
    tree = build_tree(base)
    return jsonify({"tree": tree})


# ── File content API ──────────────────────────────────────────────────────

@app.route("/api/file")
def get_file():
    project_path = request.args.get("project", "")
    file_rel = request.args.get("file", "")
    p = resolve_file(project_path, file_rel)
    if p is None or not p.is_file():
        return jsonify({"error": "not found"}), 404
    content = p.read_bytes()
    ct = mimetypes.guess_type(str(p))[0] or "application/octet-stream"
    if ct.startswith("text") or p.suffix.lower() in (".md", ".vtt", ".json"):
        return app.response_class(content, mimetype=ct or "text/plain")
    return send_from_directory(p.parent, p.name)


@app.route("/api/file", methods=["PUT"])
def save_file():
    project_path = request.args.get("project", "")
    file_rel = request.args.get("file", "")
    p = resolve_file(project_path, file_rel)
    if p is None or p.suffix.lower() != ".md":
        return jsonify({"ok": False, "error": "forbidden"}), 403
    body = request.get_data(as_text=True)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(body, encoding="utf-8")
    return jsonify({"ok": True})


# ── Git API ───────────────────────────────────────────────────────────────

def _git(args: list[str], cwd: str, timeout: int = 5) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git"] + args,
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


@app.route("/api/git/status")
def git_status():
    project_path = request.args.get("project", "")
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"modified": []})
    try:
        result = _git(["status", "--porcelain"], str(base))
        modified = set()
        for line in result.stdout.splitlines():
            if len(line) >= 3:
                path = line[3:].strip().strip('"')
                modified.add(path)
        return jsonify({"modified": list(modified)})
    except Exception as e:
        return jsonify({"modified": [], "error": str(e)})


@app.route("/api/git/diff")
def git_diff():
    project_path = request.args.get("project", "")
    file_rel = request.args.get("file", "")
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"diff": "", "error": "project not found"}), 404
    p = resolve_file(project_path, file_rel)
    if p is None:
        return jsonify({"diff": "", "error": "forbidden"}), 403
    try:
        result = _git(["diff", "HEAD", "--", file_rel], str(base))
        diff = result.stdout
        if not diff.strip():
            result2 = _git(["diff", "--no-index", "/dev/null", file_rel], str(base))
            diff = result2.stdout
        return jsonify({"diff": diff, "file": file_rel})
    except Exception as e:
        return jsonify({"diff": "", "error": str(e)})


@app.route("/api/git/head-content")
def git_head_content():
    project_path = request.args.get("project", "")
    file_rel = request.args.get("file", "")
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"content": None, "error": "project not found"}), 404
    p = resolve_file(project_path, file_rel)
    if p is None:
        return jsonify({"content": None, "error": "forbidden"}), 403
    try:
        result = _git(["show", f"HEAD:{file_rel}"], str(base))
        if result.returncode != 0:
            return jsonify({"content": None, "error": "not in HEAD"})
        return jsonify({"content": result.stdout})
    except Exception as e:
        return jsonify({"content": None, "error": str(e)})


@app.route("/api/git/diff-stat")
def git_diff_stat():
    project_path = request.args.get("project", "")
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"files": {}})
    try:
        result = _git(["diff", "HEAD", "--numstat"], str(base))
        files: dict[str, dict] = {}
        for line in result.stdout.splitlines():
            parts = line.split("\t")
            if len(parts) == 3:
                added, deleted, path = parts
                try:
                    files[path] = {"added": int(added), "deleted": int(deleted)}
                except ValueError:
                    pass
        result2 = _git(["ls-files", "--others", "--exclude-standard"], str(base))
        for path in result2.stdout.splitlines():
            if path and path not in files:
                files[path] = {"added": 0, "deleted": 0, "new": True}
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"files": {}, "error": str(e)})


# ── Tags API ──────────────────────────────────────────────────────────────

@app.route("/api/tags")
def get_tags():
    project_path = request.args.get("project", "")
    base = resolve_project_path(project_path)
    if base is None:
        return jsonify({"files": [], "total": 0})
    results = []
    total = 0
    for dirpath, dirnames, filenames in os.walk(str(base)):
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS and not d.startswith(".")
        ]
        for fname in filenames:
            if not fname.endswith(".md"):
                continue
            full = Path(dirpath) / fname
            rel = str(full.relative_to(base)).replace("\\", "/")
            try:
                content = full.read_text(encoding="utf-8")
            except Exception:
                continue
            tags = []
            in_fence = False
            for i, line in enumerate(content.splitlines(), 1):
                if _FENCE_RE.match(line):
                    in_fence = not in_fence
                    continue
                if in_fence:
                    continue
                clean = _CODE_SPAN_RE.sub("", line)
                for m in TAG_RE.finditer(clean):
                    tags.append({
                            "type": m.group(1),
                            "recipient": m.group(2) or "AI",
                            "text": m.group(3).strip(),
                            "line": i,
                        })
            if tags:
                results.append({"path": rel, "tags": tags})
                total += len(tags)
    return jsonify({"files": results, "total": total})


# ── Directory browser ────────────────────────────────────────────────────

@app.route("/api/browse")
def browse_dirs():
    raw = request.args.get("path", str(Path.home()))
    p = Path(raw).resolve()
    if not p.is_dir():
        p = p.parent
    try:
        dirs = sorted(
            [e.name for e in p.iterdir() if e.is_dir() and not e.name.startswith(".")],
            key=str.lower,
        )
    except PermissionError:
        dirs = []
    parent = str(p.parent) if p != p.parent else None
    return jsonify({"path": str(p), "parent": parent, "dirs": dirs})


# ── Frontend serving ──────────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and (DIST / path).is_file():
        return send_from_directory(DIST, path)
    index = DIST / "index.html"
    if index.is_file():
        return send_from_directory(DIST, "index.html")
    return "Frontend not built. Run: cd frontend && npm install && npm run build", 503


if __name__ == "__main__":
    print("Spec-Driven Development Workbench")
    print(f"http://127.0.0.1:3301")
    print(f"Project root: {ROOT}")
    app.run(host="127.0.0.1", port=3301, debug=False)
