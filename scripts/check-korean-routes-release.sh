#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${KOREAN_ROUTES_SMOKE_URL:-http://127.0.0.1:5000}"
server_pid=""

cleanup() {
  if [[ -n "$server_pid" ]]; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if ! curl --fail --silent --max-time 2 "$BASE_URL/" >/dev/null; then
  echo "Release validation: starting a temporary local server for Korean route smoke checks."
  npm run server:dev >"${TMPDIR:-/tmp}/startapps-korean-route-server.log" 2>&1 &
  server_pid=$!

  for attempt in {1..30}; do
    if curl --fail --silent --max-time 2 "$BASE_URL/" >/dev/null; then
      break
    fi
    if [[ "$attempt" -eq 30 ]]; then
      echo "Release validation: temporary server did not become ready." >&2
      cat "${TMPDIR:-/tmp}/startapps-korean-route-server.log" >&2 || true
      exit 1
    fi
    sleep 1
  done
else
  echo "Release validation: reusing the server already listening at ${BASE_URL}."
fi

npm run check:i18n:ko
npm run check:i18n:layout