#!/usr/bin/env bash
# Capture the emitted route manifest for before/after parity checks.
# Prints every emitted .html and .xml path (relative to dist/) sorted, so a
# diff of two captures shows exactly which URLs were added or dropped.
set -euo pipefail
cd "$(dirname "$0")/.."
out="${1:?usage: capture-routes.sh <output-file>}"
{
  shopt -s globstar nullglob
  for f in dist/**/*.html; do echo "${f#dist}"; done
  for f in dist/**/*.xml; do echo "${f#dist}"; done
} | LC_ALL=C sort > "$out"
echo "captured $(wc -l < "$out") routes -> $out"
