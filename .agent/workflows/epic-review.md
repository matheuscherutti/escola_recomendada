---
description: Record a review verdict (requested/approved/changes-requested) on an epic issue's coordination state.
---

# /epic-review - Record Epic Review Verdict

$ARGUMENTS

---

## Purpose

Tracks review status inside the coordination block itself, so `/epic-validate`-style gates (and a human re-opening the issue later) can see the verdict without scrolling the comment thread.

## Behavior

```bash
python .agent/scripts/github_coordination.py review <issue-number> --repo <owner/repo> --review approved
```

`--review` accepts `requested`, `approved`, or `changes-requested`. Writes the value into the coordination block's `review` field and posts an audit comment.

## Example

```
/epic-review 42 --repo my-org/my-repo --review changes-requested
```
