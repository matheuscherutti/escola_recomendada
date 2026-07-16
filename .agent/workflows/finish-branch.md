---
description: Closes out finished work with a structured decision (merge locally, push + PR, keep, or discard) instead of an open-ended "what now?" — verifies tests first, detects worktree vs. normal repo, cleans up only what it created.
---

# /finish-branch - Close Out Finished Work

$ARGUMENTS

---

## Purpose

Implementation is done and tests pass — now what happens to the branch? This command verifies the tests one more time, detects whether you're in a plain repo or an isolated worktree, and presents exactly the right menu (4 options normally, 3 on a detached HEAD) instead of an open-ended question. Apply the `finishing-a-branch` skill for the full decision table and cleanup rules.

---

## Behavior

1. **Verify tests** — run the project's test command. Stop here if it fails; don't offer to merge or PR a broken branch.
2. **Detect environment** — normal repo vs. linked worktree vs. detached HEAD, via `git rev-parse --git-dir` / `--git-common-dir`.
3. **Present the menu** — merge / push+PR / keep / discard (3 options if detached HEAD, no local-merge option there).
4. **Execute the choice** — merge runs tests again on the merged result before cleanup; discard requires a typed `discard` confirmation before deleting anything.
5. **Clean up** — only for merge and discard, and only a worktree under `.worktrees/`/`worktrees/` (provenance check — never remove a workspace this didn't create).
6. **Retro note (DevBureau kit repo only)** — appends a dated entry to `.agent/memory/retro-log.md` (commits shipped since the last entry, new lessons/gotchas). Skipped silently on any other project.

---

## Examples

```
/finish-branch
```

No arguments needed — it reads the current git state to decide what to ask.

---

## Key Principles

- **Tests first, always** — no option is offered on a failing branch.
- **Structured, not open-ended** — exactly 4 options (or 3), not "what would you like to do?"
- **Provenance-aware cleanup** — only removes a worktree it's confident this kit created.
- **Discard needs typed confirmation** — never deletes work on an implicit yes.
