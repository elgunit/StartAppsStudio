#!/bin/bash
# push-to-github.sh — push the current branch to GitHub origin.
# Run manually or called from post-merge.sh automatically.
#
# Uses the GitHub connector API (scripts/github-push.mjs) instead of
# `git push` over HTTPS, which hangs on a credential prompt in Replit.
#
# --force is passed because the Replit workspace is always the authoritative
# source; if GitHub has diverged (e.g. from a previous failed/partial push),
# the workspace history wins.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

node "$SCRIPT_DIR/github-push.mjs" --force
