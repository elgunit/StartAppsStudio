#!/bin/bash
# push-to-github.sh — push the current branch to GitHub origin.
# Run manually or called from post-merge.sh automatically.
set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Pushing branch '$BRANCH' to origin (GitHub)..."
git push origin "$BRANCH"
echo "GitHub sync complete: https://github.com/elgunit/StartAppsStudio/tree/$BRANCH"
