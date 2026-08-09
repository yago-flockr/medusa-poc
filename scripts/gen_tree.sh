#!/usr/bin/env bash
# Print a pruned directory tree to annotate for the architecture section.
# Usage: ./gen_tree.sh [path] [max-depth]
# Excludes noise (deps, build output, VCS, caches). Output is meant to be
# hand-annotated afterward — it is a starting point, not the final tree.
set -euo pipefail

ROOT="${1:-.}"
DEPTH="${2:-3}"

EXCLUDE='node_modules|.git|dist|build|out|.next|.nuxt|coverage|.turbo|.cache|__pycache__|.venv|venv|target|vendor|.idea|.vscode|.pnpm-store|.gradle'

if command -v tree >/dev/null 2>&1; then
  tree -a -L "$DEPTH" -I "$EXCLUDE" --dirsfirst "$ROOT"
else
  # Fallback when `tree` isn't installed: use find + sed to fake a tree.
  find "$ROOT" -maxdepth "$DEPTH" \
    -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' \
    -not -path '*/build/*' -not -path '*/.next/*' -not -path '*/coverage/*' \
    -not -path '*/__pycache__/*' -not -path '*/.venv/*' -not -path '*/venv/*' \
    -not -path '*/target/*' -not -path '*/vendor/*' \
    | sort \
    | sed -e "s|^$ROOT||" -e 's|[^/]*/|  |g'
fi
