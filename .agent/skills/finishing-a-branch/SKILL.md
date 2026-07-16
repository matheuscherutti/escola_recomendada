---
name: finishing-a-branch
description: Use when implementation is complete and tests pass, to decide how to integrate the work — guides completion with structured merge/PR/keep/discard options instead of an open-ended "what now?"
allowed-tools: Read, Bash
---

# Finishing a Branch

## Overview

Closing out finished work needs the same discipline as starting it. An open-ended "what would you like to do?" produces ambiguous answers; a structured menu doesn't.

**Core principle:** verify tests → detect the workspace environment → present exactly the right options → execute the choice → clean up.

## Step 1: Verify Tests First

Run the project's test command before presenting any options. If it fails, stop here — report the failures and do not proceed to Step 2 until they're fixed. Merging or opening a PR on a failing branch just moves the failure somewhere harder to see.

## Step 1.5: Detect Versioning Convention

Only applies to the target project (the one being worked on), never to DevBureau's own meta-process.

Detected when **both** are true:
- A version file exists: `package.json` with a `version` field (Node), or `pyproject.toml` with a `version` field under `[project]` or `[tool.poetry]` (Python). No other ecosystem is supported yet (Cargo.toml, etc.) — add support if it comes up, don't guess at the convention.
- `CHANGELOG.md` exists, follows Keep a Changelog (`## [Unreleased]` heading), and that section has actual bullet content under it — not just the empty heading.

If either is missing, or `[Unreleased]` is empty, skip this step silently and go straight to Step 2 — no bump offered, nothing to ask.

If detected, ask directly, no automatic inference from commit messages (that infrastructure doesn't exist and isn't worth building for this): **"Bump version before merging/pushing? (patch/minor/major/skip)"**

If the user picks a size: increment the right semver segment, write it back to the version file. Move `[Unreleased]`'s existing bullets under a new `### [newVersion] - YYYY-MM-DD` heading (today's date), leaving `[Unreleased]` empty above for the next round. Preserve whatever bullet style the project's own `[Unreleased]` section already uses — don't impose DevBureau's own changelog house style onto a third-party project. Commit this as its own preceding commit (`chore: bump version to X.Y.Z`), separate from whatever Step 4 does next — keeps `git log`/`git revert` clean, and an unrelated version bump never gets dragged into a revert of the actual merge/PR.

## Step 2: Detect the Environment

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

| State | Menu | Cleanup |
|---|---|---|
| `GIT_DIR == GIT_COMMON` (normal repo) | Standard 4 options | No worktree to clean up |
| `GIT_DIR != GIT_COMMON`, named branch | Standard 4 options | Provenance-based (Step 5) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | Reduced 3 options (no local merge) | None — externally managed |

## Step 3: Present Options

**Normal repo or named-branch worktree:**

```
Implementation complete. What would you like to do?
1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is
4. Discard this work
```

**Detached HEAD:**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).
1. Push as a new branch and create a Pull Request
2. Keep as-is
3. Discard this work
```

No extra explanation — keep the menu concise.

## Step 4: Execute the Choice

**Merge locally:** `cd` to the main repo root first (CWD safety if currently inside a worktree being removed), merge, re-run the test command on the merged result, only then clean up the worktree (Step 5) and `git branch -d`.

**Push + PR:** `git push -u origin <branch>`. Do **not** clean up the worktree — the user needs it alive to iterate on review feedback.

**Keep as-is:** report the branch name and worktree path. No cleanup.

**Discard:** require a typed `discard` confirmation before deleting anything — show what will be lost (branch name, commit list, worktree path) first. On confirmation: `cd` to main repo root, clean up the worktree (Step 5), then `git branch -D` (force, since the branch may be unmerged).

## Step 5: Clean Up the Workspace

**Only for the Merge and Discard options** — Push and Keep always preserve the worktree.

```bash
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**Provenance check first:** only remove a worktree under `.worktrees/` or `worktrees/` — that's the convention `using-git-worktrees` creates, so it's safe to assume ownership. A worktree anywhere else was created by the host's own native tool or the user directly; leave it alone (use a host workspace-exit tool if one exists, otherwise leave it in place).

```bash
cd "$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)"  # main repo root
git worktree remove "$WORKTREE_PATH"
git worktree prune   # clean up any stale registrations
```

Run `git worktree remove` from the main repo root, never from inside the worktree being removed — it fails silently otherwise.

## Step 6: Retro Note (DevBureau kit repo only)

Runs after Step 5, regardless of which of the 4 options was chosen (merge/push/keep/discard) — a discarded exploration is still a lesson worth a line. Only fires when the repo being finished is DevBureau's own kit repo (detected the same way as the "Localização Restrita de Integridade do Kit" rule: `.agent/rules/DEVBUREAU.md` exists at the repo root). On any other project, skip this step silently — same precedent as Step 1.5.

Ties the retro to an event that already exists (finishing a branch) instead of inventing a scheduler DevBureau doesn't have.

1. Read `.agent/memory/retro-log.md`'s last entry for the git SHA it recorded.
2. `git log <last-sha>..HEAD --oneline` to see what shipped since then (if no prior entry exists, summarize the current session's commits instead of the full history).
3. Check `.agent/memory/lessons.md` and `gotchas.md` for entries added since that SHA.
4. Append one dated entry to `retro-log.md`: commits shipped (one line each), any new lesson/gotcha worth surfacing, and the current HEAD SHA for the next run to diff against. Do not re-summarize what a prior entry already covered.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Skipping test verification | Tests fail silently downstream in the merge/PR instead |
| Open-ended "what now?" instead of the structured menu | Ambiguous answers, more back-and-forth |
| Cleaning up the worktree on the Push option | User needs it alive for PR iteration |
| Deleting the branch before removing the worktree | `git branch -d` fails — the worktree still references it |
| No confirmation before Discard | Accidental permanent loss of work |
| Removing a worktree the harness/native tool created | Provenance check exists for exactly this |
| Forgetting to bump the version when the project clearly tracks one | Step 1.5 catches this — but only if `[Unreleased]` actually has content; an empty section means there's genuinely nothing to ship |

## Integration

Pairs with `using-git-worktrees` for the setup side. `/ade`'s pipeline and `codebase-audit`'s `execute`-adjacent flows hand off here once work is done — neither prescribes what happens to the branch afterward, this skill does. When the target project follows a detectable versioning convention, Step 1.5 also touches its version file and `CHANGELOG.md` before the chosen action executes. When the repo being finished is DevBureau's own kit, Step 6 also appends a dated entry to `.agent/memory/retro-log.md`.
