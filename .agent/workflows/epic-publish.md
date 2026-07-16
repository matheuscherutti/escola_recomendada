---
description: Write the current coordination state back to a GitHub epic issue and log an audit comment.
---

# /epic-publish - Publish Coordination State

$ARGUMENTS

---

## Purpose

Explicitly re-writes the coordination block to the issue body and records the moment in a comment — the checkpoint other sessions read from when they pick the epic back up.

## Behavior

```bash
python .agent/scripts/github_coordination.py publish <issue-number> --repo <owner/repo>
```

1. Reads the current coordination block.
2. Re-writes it verbatim to the issue body (normalizes formatting, confirms the write succeeded).
3. Posts an audit comment noting the current `status`.

## Example

```
/epic-publish 42 --repo my-org/my-repo
```
