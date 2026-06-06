#!/usr/bin/env bash
# Serve project docs with Confluence-like viewer + inline markdown editing.
# Usage: ./scripts/serve-docs.sh [port]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-3001}"

cd "$ROOT"
echo "Scanning project files..."

python3 - << 'PYEOF'
import os, json

ROOT = os.getcwd()
INCLUDE_EXTS = {'.md', '.html', '.xlsx', '.pptx', '.png', '.jpg', '.vtt'}
EXCLUDE_DIRS = {'node_modules', '.git', '__pycache__', 'docs-preview', '.claude', 'chrome_extension', 'chrome_extension_ng', 'pim-dashboard', 'dist'}
EXCLUDE_FILES = {'files.json', '_sidebar.md'}

def build_tree(path, rel=''):
    entries = sorted(os.scandir(path), key=lambda e: (not e.is_dir(), e.name.lower()))
    children = []
    for e in entries:
        if e.name.startswith('.'):
            continue
        if e.is_dir():
            if e.name in EXCLUDE_DIRS:
                continue
            sub = build_tree(e.path, os.path.join(rel, e.name) if rel else e.name)
            if sub:
                children.append({'name': e.name, 'path': os.path.join(rel, e.name) if rel else e.name, 'type': 'dir', 'children': sub})
        else:
            ext = os.path.splitext(e.name)[1].lower()
            if ext not in INCLUDE_EXTS or e.name in EXCLUDE_FILES:
                continue
            frel = os.path.join(rel, e.name) if rel else e.name
            children.append({'name': e.name, 'path': frel, 'type': ext.lstrip('.')})
    return children

tree = build_tree(ROOT)
with open('docs-preview/files.json', 'w') as f:
    json.dump({'tree': tree}, f, indent=2)
print("  docs-preview/files.json written")
PYEOF

echo ""
echo "Starting server → http://localhost:$PORT/docs-preview/"
echo "Supports inline markdown editing (PUT requests)"
echo "Ctrl+C to stop."
echo ""

(sleep 1 && open "http://localhost:$PORT/docs-preview/" 2>/dev/null || true) &

python3 - "$PORT" "$ROOT" << 'PYEOF'
import sys, os, json, mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

PORT = int(sys.argv[1])
ROOT = Path(sys.argv[2]).resolve()

class DocsHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"  {args[0]} {args[1]}", flush=True)

    def resolve(self):
        url = self.path.split('?')[0]
        if url in ('', '/', '/docs-preview', '/docs-preview/'):
            url = '/docs-preview/index.html'
        p = (ROOT / url.lstrip('/')).resolve()
        if not str(p).startswith(str(ROOT)):
            return None  # path traversal guard
        return p

    def build_tree(self, path, rel=''):
        INCLUDE = {'.md','.html','.xlsx','.pptx','.png','.jpg','.vtt','.json'}
        EXCLUDE_DIRS = {'node_modules','.git','__pycache__','docs-preview','.claude','chrome_extension','chrome_extension_ng','pim-dashboard','dist'}
        EXCLUDE_FILES = {'files.json','_sidebar.md','package.json','tsconfig.json','angular.json'}
        try:
            entries = sorted(path.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower()))
        except PermissionError:
            return []
        children = []
        for e in entries:
            if e.name.startswith('.'):
                continue
            if e.is_dir():
                if e.name in EXCLUDE_DIRS:
                    continue
                sub = self.build_tree(e, f"{rel}/{e.name}" if rel else e.name)
                if sub:
                    children.append({'name':e.name,'path':f"{rel}/{e.name}" if rel else e.name,'type':'dir','children':sub})
            else:
                ext = e.suffix.lower()
                if ext not in INCLUDE or e.name in EXCLUDE_FILES:
                    continue
                frel = f"{rel}/{e.name}" if rel else e.name
                children.append({'name':e.name,'path':frel,'type':ext.lstrip('.')})
        return children

    def do_GET(self):
        url_path=self.path.split('?')[0]
        # Dynamic file tree — always fresh
        if url_path in ('/docs-preview/files.json', '/files.json'):
            tree = self.build_tree(ROOT)
            data = json.dumps({'tree': tree}).encode()
            self.send_response(200)
            self.send_header('Content-Type','application/json')
            self.send_header('Content-Length',str(len(data)))
            self.send_header('Access-Control-Allow-Origin','*')
            self.end_headers()
            self.wfile.write(data)
            return
        if url_path == '/_git/status':
            self.do_GET_git_status()
            return
        if url_path == '/_git/diff':
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            file_path = qs.get('file', [''])[0]
            self.do_GET_git_diff(file_path)
            return
        if url_path == '/_git/head-content':
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
            file_path = qs.get('file', [''])[0]
            self.do_GET_head_content(file_path)
            return
        if url_path == '/_tags':
            self.do_GET_tags()
            return
        if url_path == '/_git/diff-stat':
            self.do_GET_diff_stat()
            return
        p = self.resolve()
        if p is None or not p.is_file():
            self.send_error(404)
            return
        data = p.read_bytes()
        ct = mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
        if ct.startswith('text'):
            ct += '; charset=utf-8'
        self.send_response(200)
        self.send_header('Content-Type', ct)
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Content-Length')
        self.end_headers()

    def do_GET_git_diff(self, file_path):
        """Return unified diff for a single file vs HEAD."""
        import subprocess
        from pathlib import Path
        p = (ROOT / file_path).resolve()
        if not str(p).startswith(str(ROOT)):
            self.send_response(403); self.end_headers(); return
        try:
            # Try working tree diff (unstaged changes)
            result = subprocess.run(
                ['git', 'diff', 'HEAD', '--', file_path],
                cwd=str(ROOT), capture_output=True, text=True, timeout=3
            )
            diff = result.stdout
            # If no diff (file might be new/untracked), try diff against /dev/null
            if not diff.strip():
                result2 = subprocess.run(
                    ['git', 'diff', '--no-index', '/dev/null', file_path],
                    cwd=str(ROOT), capture_output=True, text=True, timeout=3
                )
                diff = result2.stdout
            data = json.dumps({'diff': diff, 'file': file_path}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500); self.end_headers()
            self.wfile.write(json.dumps({'diff': '', 'error': str(e)}).encode())

    def do_GET_tags(self):
        """Scan all .md files for inline tags [TODO],[REVIEW],[REWORK],[CLARIFY],[COMMENT]."""
        import subprocess, re
        TAG_RE = re.compile(r'\[(TODO|REVIEW|REWORK|CLARIFY|COMMENT)\]([^\n]*)')
        EXCLUDE = {'node_modules', '.git', 'docs-preview', '.claude', 'pim-dashboard', 'dist', 'chrome_extension', 'chrome_extension_ng'}
        results = []
        total = 0
        try:
            for dirpath, dirnames, filenames in os.walk(str(ROOT)):
                dirnames[:] = [d for d in dirnames if d not in EXCLUDE and not d.startswith('.')]
                for fname in filenames:
                    if not fname.endswith('.md'):
                        continue
                    full = os.path.join(dirpath, fname)
                    rel = os.path.relpath(full, str(ROOT))
                    try:
                        content = open(full, encoding='utf-8').read()
                    except Exception:
                        continue
                    tags = []
                    for i, line in enumerate(content.splitlines(), 1):
                        for m in TAG_RE.finditer(line):
                            tags.append({'type': m.group(1), 'text': m.group(2).strip(), 'line': i})
                    if tags:
                        results.append({'path': rel.replace('\\', '/'), 'tags': tags})
                        total += len(tags)
            data = json.dumps({'files': results, 'total': total}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500); self.end_headers()
            self.wfile.write(json.dumps({'files': [], 'total': 0, 'error': str(e)}).encode())

    def do_GET_diff_stat(self):
        """Return per-file +/- line counts for uncommitted changes."""
        import subprocess
        try:
            result = subprocess.run(
                ['git', 'diff', 'HEAD', '--numstat'],
                cwd=str(ROOT), capture_output=True, text=True, timeout=3
            )
            files = {}
            for line in result.stdout.splitlines():
                parts = line.split('\t')
                if len(parts) == 3:
                    added, deleted, path = parts
                    try: files[path] = {'added': int(added), 'deleted': int(deleted)}
                    except ValueError: pass
            # Also include untracked new files
            result2 = subprocess.run(
                ['git', 'ls-files', '--others', '--exclude-standard'],
                cwd=str(ROOT), capture_output=True, text=True, timeout=3
            )
            for path in result2.stdout.splitlines():
                if path and path not in files:
                    files[path] = {'added': 0, 'deleted': 0, 'new': True}
            data = json.dumps({'files': files}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500); self.end_headers()
            self.wfile.write(json.dumps({'files': {}, 'error': str(e)}).encode())

    def do_GET_head_content(self, file_path):
        """Return file content at HEAD commit."""
        import subprocess
        p = (ROOT / file_path).resolve()
        if not str(p).startswith(str(ROOT)):
            self.send_response(403); self.end_headers(); return
        try:
            result = subprocess.run(
                ['git', 'show', f'HEAD:{file_path}'],
                cwd=str(ROOT), capture_output=True, text=True, timeout=3
            )
            if result.returncode != 0:
                data = json.dumps({'content': None, 'error': 'File not in HEAD'}).encode()
            else:
                data = json.dumps({'content': result.stdout}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500); self.end_headers()
            self.wfile.write(json.dumps({'content': None, 'error': str(e)}).encode())

    def do_GET_git_status(self):
        """Return list of modified/untracked files as JSON."""
        import subprocess
        try:
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=str(ROOT), capture_output=True, text=True, timeout=3
            )
            modified = set()
            for line in result.stdout.splitlines():
                if len(line) >= 3:
                    status = line[:2].strip()
                    path = line[3:].strip().strip('"')
                    if status:
                        modified.add(path)
            data = json.dumps({'modified': list(modified)}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'modified': [], 'error': str(e)}).encode())

    def do_PUT(self):
        """Save a markdown file — only .md within ROOT allowed."""
        url = self.path.split('?')[0]
        p = (ROOT / url.lstrip('/')).resolve()
        if not str(p).startswith(str(ROOT)) or p.suffix.lower() != '.md':
            self.send_response(403)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': 'Forbidden'}).encode())
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode('utf-8')
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(body, encoding='utf-8')
            print(f"  SAVED {url}", flush=True)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': True}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode())

print(f"Serving on http://localhost:{PORT}/", flush=True)
HTTPServer(('', PORT), DocsHandler).serve_forever()
PYEOF
