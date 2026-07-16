---
description: Claim a GitHub epic issue as the source of truth for a unit of work, so another session/agent knows it's taken.
---

# /epic-claim - Claim an Epic Issue

$ARGUMENTS

---

## Purpose

Optional coordination layer for `/squad` and `/ade` when work spans multiple sessions or agents that don't share a disk. GitHub Issues become the shared state; this command marks one issue as claimed before work starts, so a second session doesn't duplicate it.

## Behavior

```bash
python .agent/scripts/github_coordination.py claim <issue-number> --repo <owner/repo> --actor <name>
```

1. Preflights `gh auth status` and repo access (warns if the repo is public — coordination comments are visible).
2. Reads the issue body's `<!-- devbureau-coordination: {...} -->` block (created if absent).
3. Refuses if already claimed by someone else; otherwise sets `status: running`, `claimed_by: <actor>`.
4. Writes the updated block back to the issue body and posts an audit comment.

## Example

```
/epic-claim 42 --repo my-org/my-repo --actor claude-session-a
```
