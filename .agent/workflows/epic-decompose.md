---
description: Read an epic issue's checklist and record it as the coordination block's task list.
---

# /epic-decompose - Decompose an Epic Issue

$ARGUMENTS

---

## Purpose

Turns an epic issue's markdown checklist (`- [ ] task`) into a structured task list inside the coordination block, so other commands (`/epic-validate`, `/epic-sync`) can reason about progress without re-parsing prose each time.

## Behavior

```bash
python .agent/scripts/github_coordination.py decompose <issue-number> --repo <owner/repo>
```

1. Reads the issue body for `- [ ]`/`- [x]` lines.
2. Stores the extracted task list in the coordination block's `tasks` field.
3. Posts a short audit comment with the count.

Does not create separate GitHub sub-issues or branches — the task list stays inside the parent issue's coordination block, matching `squad-forge`'s single-state-object model rather than spawning new coordination targets.

## Example

```
/epic-decompose 42 --repo my-org/my-repo
```
