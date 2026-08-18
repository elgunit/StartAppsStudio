---
name: GitHub push authentication in this Repl
description: Shell `git push` over HTTPS fails here; use scripts/github-push.mjs via the GitHub connector instead.
---

# GitHub push authentication

**Fragile dependency:** the push script imports `@replit/connectors-sdk`. Dependency cleanups (`npm audit fix`, lockfile prunes) can strip it from `node_modules` even though it stays in `package.json`, making the push workflow die instantly with `ERR_MODULE_NOT_FOUND`. Reinstall it before retrying — don't debug the script.

**Oversized blobs:** the GitHub API rejects blobs over ~40 MB; the script skips them (logged as "Skipping oversized blob"), so any large media in git history is permanently absent from the GitHub mirror.

Shell `git push origin main` hangs in this Repl because `replit-git-askpass` cannot supply credentials.

**Durable decision:** always use `bash scripts/push-to-github.sh` for GitHub backups. The script (`scripts/github-push.mjs`) uses the Replit GitHub connector (slug `github`) via the REST Git Data API — no HTTPS credentials needed.

**Why:** the account-level GitHub connection handles OAuth automatically through the connector proxy; raw `git push` over HTTPS does not.

**Force-push policy:** the shell script always passes `--force` because the Replit workspace is the authoritative source. Remote SHAs may differ from local SHAs (GitHub normalises timestamps internally); this is handled by a persistent SHA map (`.git/github-sha-map.json`).
