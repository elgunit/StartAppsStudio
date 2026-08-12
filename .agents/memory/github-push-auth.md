---
name: GitHub push authentication in this Repl
description: Shell `git push` to GitHub over HTTPS fails here; backups must go through the GitHub connection's API by replaying commits (SHA-preserving).
---

# GitHub push authentication

Shell `git push origin main` (and the "Push to GitHub" workflow) fails in this Repl: the `replit-git-askpass` helper returns no GitHub credentials, so HTTPS pushes hang on a username prompt or fail with "Invalid username or token".

**Working method:** the account-level GitHub connection (Replit integration, connector slug `github`) can push by replaying unpushed commits through the REST API:
1. `POST /repos/{owner}/{repo}/git/blobs` for each changed blob (base64) — returned SHA must equal the local blob SHA.
2. `POST /git/trees` with `base_tree` = parent commit's tree + changed entries — returned SHA must equal the local tree SHA.
3. `POST /git/commits` with the exact author/committer name, email, and timezone-offset dates parsed from `git cat-file commit` — returned SHA equals the local commit SHA, so local and remote histories stay identical (no force-push, no divergence).
4. `PATCH /git/refs/heads/main` (fast-forward) to the final commit.
5. Then `git update-ref refs/remotes/origin/main <sha>` locally so `git status` shows in-sync.

**Why:** `PATCH /git/refs` alone cannot receive new objects (422 "Object does not exist"); the objects must be created first. GPG-signed commits cannot be replayed byte-identically — check for `gpgsig` in the raw commit header and bail out.

**How to apply:** whenever the user asks for a GitHub backup/push and shell push fails with askpass/auth errors, skip credential debugging and use the API replay directly. Repo: `elgunit/StartAppsStudio`.
