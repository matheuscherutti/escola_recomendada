---
description: Check whether an epic issue is ready to proceed — claimed, and every declared dependency closed.
---

# /epic-validate - Validate Epic Readiness

$ARGUMENTS

---

## Purpose

A gate before `/epic-publish` or handing an epic to review: confirms the issue is actually claimed and every issue it depends on (`depends_on` in the coordination block) is closed, instead of trusting that by assumption.

## Behavior

```bash
python .agent/scripts/github_coordination.py validate <issue-number> --repo <owner/repo>
```

1. Reads the coordination block.
2. Fails if `claimed_by` is empty.
3. Fails if any issue number in `depends_on` is not `CLOSED`.
4. Prints `NOT READY: <reasons>` and exits non-zero, or confirms readiness.

## Example

```
/epic-validate 42 --repo my-org/my-repo
```
