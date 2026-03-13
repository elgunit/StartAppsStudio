#!/bin/bash
set -e
echo "Post-merge setup: running db:push..."
npm run db:push --force 2>/dev/null || true
echo "Post-merge setup: complete."
