#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$ROOT/frontend"
DIST="$FRONTEND/dist"

# Build frontend if dist doesn't exist
if [ ! -f "$DIST/index.html" ]; then
  echo "Building frontend..."
  cd "$FRONTEND"
  npm install --silent
  npm run build --silent
  cd "$ROOT"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Spec-Driven Development Workbench — we+"
echo "  http://127.0.0.1:3301"
echo "  Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

(sleep 1 && open "http://127.0.0.1:3301" 2>/dev/null || true) &

cd "$ROOT"
python3.13 app/app.py
