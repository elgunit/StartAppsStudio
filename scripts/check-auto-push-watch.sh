#!/bin/bash
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WATCHER="$SCRIPT_DIR/auto-push-watch.sh"

run_case() {
  local name="$1"
  local push_output="$2"
  local expected="$3"
  local tmp status output

  tmp=$(mktemp -d)
  mkdir -p "$tmp/scripts" "$tmp/.git" "$tmp/bin"
  cp "$WATCHER" "$tmp/scripts/auto-push-watch.sh"

  cat > "$tmp/bin/git" <<'EOF'
#!/bin/bash
case "$*" in
  *"rev-parse HEAD"*) echo abc123 ;;
  *"rev-list --count"*) echo 1 ;;
  *) exit 1 ;;
esac
EOF
  printf '#!/bin/bash\nprintf "%%s\\n" "$PUSH_TEST_OUTPUT" >&2\nexit 1\n' > "$tmp/scripts/push-to-github.sh"
  chmod +x "$tmp/bin/git" "$tmp/scripts/push-to-github.sh"

  set +e
  output=$(cd "$tmp" && PUSH_TEST_OUTPUT="$push_output" PATH="$tmp/bin:$PATH" \
    AUTO_PUSH_INTERVAL=0 timeout 0.2 bash scripts/auto-push-watch.sh 2>&1)
  status=$?
  set -e
  rm -rf "$tmp"

  if [ "$expected" = "pause" ]; then
    [ "$status" -eq 1 ] &&
      grep -q 'Automatic retries are paused' <<< "$output" &&
      [ "$(grep -c 'new commit(s) detected' <<< "$output")" -eq 1 ]
  else
    [ "$status" -eq 124 ] &&
      grep -q 'Transient connector/GitHub failure' <<< "$output" &&
      [ "$(grep -c 'new commit(s) detected' <<< "$output")" -gt 1 ] &&
      ! grep -q 'Automatic retries are paused' <<< "$output"
  fi

  echo "[auto-push-test] PASS: $name"
}

run_case "tree 422 pauses" \
  'GitHub API POST /repos/acme/demo/git/trees → 422: {"message":"Invalid tree"}' pause
run_case "tree 429 retries" \
  'GitHub API POST /repos/acme/demo/git/trees → 429: {"message":"Too many requests"}' retry
run_case "tree rate-limit 403 retries" \
  'GitHub API POST /repos/acme/demo/git/trees → 403: {"message":"secondary rate limit"}' retry
run_case "non-tree 4xx retries" \
  'GitHub API POST /repos/acme/demo/git/blobs → 422: {"message":"Invalid blob"}' retry