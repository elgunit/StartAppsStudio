---
name: CodeExecution file access
description: Durable sandbox file I/O compatibility
---

Use the registered readFile and writeFile callbacks for workspace file access inside CodeExecution rather than importing node:fs/promises.

**Why:** The durable sandbox does not expose node:fs/promises, while the registered callbacks provide workspace-safe text reads and writes.

**How to apply:** Keep ordinary shell reads and apply_patch edits for normal work; use readFile/writeFile when a CodeExecution workflow needs to transform several workspace text files.