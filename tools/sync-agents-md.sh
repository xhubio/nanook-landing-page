#!/bin/sh
# /agents.md: the guide a coding agent follows (the "agents.md" button in the
# bar copies a prompt pointing at it). The source is docs/agents.md in
# nanook-table; this copies it to the site root. Run after every change there.
# Argument: path to the nanook-table checkout (default: ../nanook-table).
# Without a checkout: curl -o agents.md https://unpkg.com/@xhubio/nanook-table/docs/agents.md
set -e
cd "$(dirname "$0")/.."
SRC="${1:-../nanook-table}/docs/agents.md"
[ -f "$SRC" ] || { echo "not found: $SRC" >&2; exit 1; }
cp "$SRC" agents.md
echo "agents.md <- $SRC ($(wc -c < agents.md | tr -d ' ') bytes)"
