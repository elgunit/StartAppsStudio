---
name: Workspace read-only recovery
description: What to do when the workspace filesystem goes read-only (btrfs ro mount) mid-session.
---

# Workspace read-only recovery

The workspace volume can spontaneously remount read-only: every file write fails with `EROFS`, and `mount | grep workspace` shows `btrfs (ro,...)`.

**Why:** platform-level issue with the managed volume — not disk-full (df showed 1% used), not a code problem. Happened Aug 2026 and persisted ~30+ min.

**How to apply:**
- Diagnose with `touch <file>` + `mount | grep workspace` — don't retry edits blindly.
- Restarting a workflow does NOT fix it; only a full Repl stop/restart (user action) remounts rw. Polling from inside the session never recovered it; the fix arrived after user restarted.
- While read-only: queue the exact edits (scoped and ready), keep working read-only (exploration, planning), and tell the user precisely how to recover. `/tmp` stays writable.
- Never attempt `mount -o remount,rw` on the managed volume.
