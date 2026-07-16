---
description: Pull the current state of every devbureau-epic-labeled issue into a local read-only JSON cache.
---

# /epic-sync - Sync Epic State Locally

$ARGUMENTS

---

## Purpose

GitHub is the source of truth; this command just mirrors it locally as a read-only snapshot, so a session can inspect epic state without repeated `gh` round-trips.

## Behavior

```bash
python .agent/scripts/github_coordination.py sync --repo <owner/repo>
```

1. Lists every issue labeled `devbureau-epic` in the repo.
2. Parses each one's coordination block.
3. Writes the snapshot to `.agent/.tmp/epic-cache/<owner>_<repo>.json` (gitignored, same scratch directory as the hook state files).

## Example

```
/epic-sync --repo my-org/my-repo
```
