#!/usr/bin/env bash
# Sensor: fail if any doc file references a repo path that does not exist.
# Extracts backtick-quoted tokens starting with src/, scripts/, public/, or
# docs/ from the tracked doc files and checks each one exists.
set -u
cd "$(dirname "$0")/.."

files=(
  README.md AGENTS.md src/README.md src/components/README.md
  src/components/cv/README.md src/layouts/README.md src/pages/_README.md
  scripts/README.md src/content/README.md docs/README.md docs/depth-parallax-research.md
  docs/docker.md docs/performance.md
)

stale=$(
  for f in "${files[@]}"; do
    [ -f "$f" ] || { echo "MISSING DOC: $f"; continue; }
    grep -oE '`/?(src|scripts|public|docs)/[^`]+`' "$f" | tr -d '`' | while read -r p; do
      p="${p%%#*}"   # strip anchors
      p="${p#/}"     # strip leading slash
      p="${p%/}"     # tolerate trailing slash
      case "$p" in *"{"*|*"}"*|*"*"*|*"<"*|*">"*) continue ;; esac  # skip templates/globs/placeholders
      [ -e "$p" ] || echo "STALE: $f -> $p"
    done
  done
)

if [ -n "$stale" ]; then
  echo "$stale"
  exit 1
fi
echo "all doc path references resolve"
