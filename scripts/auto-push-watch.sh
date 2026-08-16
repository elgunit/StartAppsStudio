#!/bin/bash
# auto-push-watch.sh — background daemon that pushes to GitHub whenever new
# local commits appear. Runs alongside the dev server so GitHub stays
# current between task merges.
#
# Stores the last successfully-pushed HEAD SHA in .git/auto-push-last-sha.
# Pushes are rate-limited: at most one push every INTERVAL seconds even if
# many commits land in quick succession.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAST_SHA_FILE="$REPO_ROOT/.git/auto-push-last-sha"
INTERVAL="${AUTO_PUSH_INTERVAL:-300}"   # default: check every 5 minutes

echo "[auto-push] Watcher started (interval: ${INTERVAL}s)."

while true; do
  sleep "$INTERVAL"

  CURRENT_SHA=$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null) || continue
  LAST_SHA=$(cat "$LAST_SHA_FILE" 2>/dev/null || echo "")

  if [ "$CURRENT_SHA" = "$LAST_SHA" ]; then
    # Nothing new since last push — stay quiet.
    continue
  fi

  BEHIND=$(git -C "$REPO_ROOT" rev-list --count "$LAST_SHA".."$CURRENT_SHA" 2>/dev/null || echo "?")
  echo "[auto-push] ${BEHIND} new commit(s) detected — pushing to GitHub…"

  if bash "$SCRIPT_DIR/push-to-github.sh"; then
    echo "$CURRENT_SHA" > "$LAST_SHA_FILE"
    echo "[auto-push] Push successful at $(date -u '+%Y-%m-%dT%H:%M:%SZ')."
  else
    echo "[auto-push] Push failed — will retry in ${INTERVAL}s."
  fi
done
