---
name: Workflow port detection fix
description: Why "Start Backend" timed out with "didn't open port 5000" and how it was fixed
---

The rule: every `[[ports]]` entry in `.replit` for a web-facing workflow needs an explicit `externalPort` (e.g. `localPort = 5000` + `externalPort = 80`).

**Why:** With only `localPort` set, the platform never forwarded/detected the port — `WorkflowsRestart` timed out with "didn't open port 5000" even while logs showed the Express server serving, and the process was then killed. Adding `externalPort = 80` fixed restarts permanently (Aug 2026).

**How to apply:** If a workflow restart times out on a port despite healthy server logs, check `.replit` `[[ports]]` for a missing `externalPort` before debugging code. Also note: `.replit` can only be changed via a temp file **inside the workspace** (absolute path) passed to `verifyAndReplaceDotReplit({ tempFilePath })`. Background servers started via ShellExec (even setsid/nohup) are killed between tool calls — use the workflow.
