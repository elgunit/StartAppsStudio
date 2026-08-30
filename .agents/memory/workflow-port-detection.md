---
name: Workflow port detection fix
description: Why "Start Backend" timed out with "didn't open port 5000" and how it was fixed
---

The rule: every `[[ports]]` entry in `.replit` for a web-facing workflow needs an explicit `externalPort` (e.g. `localPort = 5000` + `externalPort = 80`). The configured `runButton` must also target the real port-5000 workflow, and that workflow must use `outputType = "webview"`.

**Why:** Port forwarding can fail despite a healthy Express server. A missing `externalPort` caused detection timeouts; separately, a stale `runButton` pointing at an unavailable parent workflow made Preview appear down while both localhost and the proxied domain returned HTTP 200.

**How to apply:** If Preview is down despite healthy server logs, verify the port mapping, query the active workflow registry, confirm the port-5000 workflow is a webview, and ensure `runButton` names that exact workflow. `.replit` can only be changed via an in-workspace absolute temp file passed to `verifyAndReplaceDotReplit({ tempFilePath })`. Background servers started via ShellExec are killed between tool calls, so use workflows.
