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

is_permanent_tree_error() {
  local output="$1"

  # Timeouts, conflicts, and throttling can resolve without changing the commit.
  if grep -Eq 'GitHub API (POST|PATCH|PUT) /repos/[^ ]+/git/trees([^ ]*)? → (408|409|425|429):' <<< "$output"; then
    return 1
  fi

  # GitHub reports both permission failures and rate limits as 403. Retry only
  # the latter; a rejected credential/WAF request needs operator intervention.
  if grep -Eq 'GitHub API (POST|PATCH|PUT) /repos/[^ ]+/git/trees([^ ]*)? → 403:' <<< "$output"; then
    ! grep -Eiq 'rate.?limit|secondary rate|abuse detection|retry.after' <<< "$output"
    return
  fi

  grep -Eq 'GitHub API (POST|PATCH|PUT) /repos/[^ ]+/git/trees([^ ]*)? → (400|401|404|405|410|422):' <<< "$output"
}

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

  PUSH_OUTPUT=$(bash "$SCRIPT_DIR/push-to-github.sh" 2>&1)
  PUSH_STATUS=$?
  printf '%s\n' "$PUSH_OUTPUT"

  if [ "$PUSH_STATUS" -eq 0 ]; then
    echo "$CURRENT_SHA" > "$LAST_SHA_FILE"
    echo "[auto-push] Push successful at $(date -u '+%Y-%m-%dT%H:%M:%SZ')."
  elif is_permanent_tree_error "$PUSH_OUTPUT"; then
    echo "[auto-push] Permanent GitHub tree error detected. Automatic retries are paused."
    echo "[auto-push] The GitHub 4xx response above indicates that GitHub rejected the tree request; retrying unchanged commits will not fix it."
    echo "[auto-push] Inspect the rejected path/payload in the response, fix the offending commit or push script, then restart the Auto Push to GitHub workflow."
    exit "$PUSH_STATUS"
  else
    echo "[auto-push] Transient connector/GitHub failure — will retry in ${INTERVAL}s."
  fi
done
