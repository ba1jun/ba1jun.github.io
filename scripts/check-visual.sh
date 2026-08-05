#!/usr/bin/env bash
# Visual-regression sensor for the self-correcting loop.
#
# Rebuilds the site, serves dist/ on a throwaway port, screenshots a fixed set
# of routes in headless Chromium, and pixel-diffs each against the committed,
# human-approved baselines in tests/baselines/. Exits non-zero if any route
# regresses beyond its per-route tolerance.
#
# The home page hero image is chosen client-side at random (randomImage.ts), so
# its baseline is inherently unstable; it uses a loose tolerance. All other
# routes are deterministic and must match exactly.
set -euo pipefail
cd "$(dirname "$0")/.."

LOOP_DIR="$HOME/.pi/agent/skills/self-correcting-loop"
BA="$LOOP_DIR/browser-assert.ts"
PD="$LOOP_DIR/pixel-diff.ts"
PORT="${VISUAL_PORT:-4399}"
BASE_URL="http://localhost:${PORT}"
WORKDIR="$(mktemp -d)"
PREVIEW_PID=""

cleanup() {
  [ -n "$PREVIEW_PID" ] && kill "$PREVIEW_PID" 2>/dev/null || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

# Rebuild (warm cache -> fast). Playwright/preview serve from dist/.
bun run build >/dev/null

# Serve dist/ on the throwaway port. Prefer astro preview's --port; it reads
# the dist/ directory produced above.
bun run preview -- --port "$PORT" --host 127.0.0.1 >"$WORKDIR/preview.log" 2>&1 &
PREVIEW_PID=$!

# Wait for the server to accept connections.
for _ in $(seq 1 40); do
  if curl -sf -o /dev/null "$BASE_URL/"; then break; fi
  sleep 0.5
done
curl -sf -o /dev/null "$BASE_URL/" || { echo "visual: preview server did not come up"; exit 1; }

# route:tolerance  (tolerance = allowed fraction of changed pixels)
ROUTES=(
  "/:0.55:home"
  "/long_form/:0:long_form_"
  "/long_form/adam/:0:long_form_adam_"
  "/muses/:0:muses_"
  "/authors/:0:authors_"
  "/cv/:0:cv_"
)

fail=0
for entry in "${ROUTES[@]}"; do
  IFS=':' read -r route tol name <<<"$entry"
  shot="$WORKDIR/$name.png"
  baseline="tests/baselines/$name.png"
  if [ ! -f "$baseline" ]; then
    echo "visual: MISSING baseline $baseline (commit it after approving)"
    fail=1
    continue
  fi
  bun "$BA" "$BASE_URL$route" --viewport 1280x800 --screenshot "$shot" >/dev/null 2>&1 || {
    echo "visual: FAILED to render $route"
    fail=1
    continue
  }
  if bun "$PD" --baseline "$baseline" --current "$shot" --max-diff-ratio "$tol" \
       --diff-out "$WORKDIR/$name-diff.png" >"$WORKDIR/$name.out" 2>&1; then
    echo "visual: PASS $route (tol $tol)"
  else
    echo "visual: FAIL $route (tol $tol)"
    tail -1 "$WORKDIR/$name.out"
    fail=1
  fi
done

exit "$fail"
