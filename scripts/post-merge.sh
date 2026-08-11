#!/bin/bash
set -e
echo "Post-merge setup: running db:push..."
npm run db:push --force 2>/dev/null || true
echo "Post-merge setup: complete."

# Auto-push to GitHub so the backup stays current after every task merge.
echo "Post-merge setup: pushing to GitHub..."
bash "$(dirname "$0")/push-to-github.sh" || echo "Warning: GitHub push failed (credentials may not be available in this context). Run the 'Push to GitHub' workflow manually."
