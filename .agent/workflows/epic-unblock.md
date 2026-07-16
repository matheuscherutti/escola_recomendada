---
description: Sweep issues labeled "blocked" and reopen any whose declared dependencies have all closed.
---

# /epic-unblock - Sweep Blocked Epics

$ARGUMENTS

---

## Purpose

Blocked epics don't unblock themselves — this command scans every issue labeled `blocked` in a repo, checks each one's `depends_on` list, and moves the ones whose dependencies are now closed back to `running`.

## Behavior

```bash
python .agent/scripts/github_coordination.py unblock --repo <owner/repo>
```

1. Lists issues labeled `blocked` via `gh issue list`.
2. For each, checks every dependency in its coordination block.
3. Sets `status: running` and posts an audit comment for any issue whose dependencies are all closed.
4. Prints the list of unblocked issue numbers.

## Example

```
/epic-unblock --repo my-org/my-repo
```
