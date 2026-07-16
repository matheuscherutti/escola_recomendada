---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from the current workspace, or before executing an implementation plan — ensures an isolated workspace exists via the host's native tool or a plain git worktree fallback.
allowed-tools: Read, Bash
---

# Using Git Worktrees

## Overview

Isolate work in its own workspace so it can't disturb the branch the user is already on. Prefer the host's native worktree tool when one exists; fall back to plain `git worktree` only when it doesn't.

**Core principle:** detect existing isolation first, then prefer native tools, then fall back to git. Never fight the harness — using raw `git worktree add` when a native tool already manages isolation creates state the harness can't see.

This is portable across every host DevBureau syncs to: the git fallback is plain git, no special host capability required. The only thing that varies by host is whether Step 1a's native tool exists.

## Step 0: Detect Existing Isolation

Before creating anything, check whether you're already in one:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

**Submodule guard** — `GIT_DIR != GIT_COMMON` is also true inside a submodule. Before concluding "already isolated," check:

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
# Returns a path → you're in a submodule, not a worktree. Treat as a normal repo.
```

**If `GIT_DIR != GIT_COMMON` and not a submodule:** already in a linked worktree. Skip to Step 2.

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** normal repo checkout. Ask for consent before creating a worktree if the user hasn't already stated a preference: *"Would you like an isolated worktree for this? It protects your current branch from changes."* Honor a stated preference without re-asking. If declined, work in place and skip to Step 2.

## Step 1: Create the Isolated Workspace

### 1a. Native tool (preferred)

If the host already has a worktree-isolation tool (e.g. an `EnterWorktree`-style tool, a `/worktree` command, a `--worktree` flag), use it and skip to Step 2. It handles directory placement, branch creation, and cleanup — `git worktree add` on top of one creates phantom state.

### 1b. Plain git fallback (only if 1a doesn't apply)

```bash
ls -d .worktrees 2>/dev/null || ls -d worktrees 2>/dev/null   # check for an existing convention
```

Priority: an explicit user-stated directory beats an existing project convention beats the default. If neither exists, default to `.worktrees/` at the project root.

**Verify the directory is git-ignored before creating anything in it:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If not ignored, add it to `.gitignore` and commit that change first — otherwise the worktree's contents get tracked.

```bash
git worktree add ".worktrees/<branch-name>" -b "<branch-name>"
cd ".worktrees/<branch-name>"
```

**Sandbox fallback:** if `git worktree add` fails on a permission error (sandbox denial), tell the user the sandbox blocked it and continue in the current directory instead — run setup and the baseline check there.

## Step 2: Project Setup

Auto-detect and run the project's install step (`npm install` / `cargo build` / `pip install -r requirements.txt` or `poetry install` / `go mod download`) based on which manifest file is present. Skip if none match.

## Step 3: Verify a Clean Baseline

Run the project's test command before starting work. If it fails, report the failures and ask whether to proceed or investigate first — don't start new work on top of an already-broken baseline without the user knowing. If it passes, report ready and the worktree path.

## Quick Reference

| Situation | Action |
|---|---|
| Already in a linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as a normal repo |
| Native worktree tool available | Use it, skip the git fallback entirely |
| `.worktrees/` exists | Use it (verify it's ignored) |
| Neither exists | Default to `.worktrees/` |
| Directory not ignored | Add to `.gitignore` + commit, then proceed |
| Permission error on create | Sandbox fallback — work in place |
| Tests fail on baseline | Report + ask before proceeding |

## Common Mistakes

- **Fighting the harness**: using raw `git worktree add` when the host already provides isolation — always run Step 0/1a first.
- **Skipping the ignore check**: worktree contents get tracked, polluting `git status` for the main checkout.
- **Proceeding with a failing baseline**: can't tell new bugs from pre-existing ones afterward.

## Integration

Pairs with `finishing-a-branch` for the close-out side (merge/PR/keep/discard + matching cleanup). Optional setup step before `/ade`'s Execution phase or `codebase-audit`'s `plan <description>` variant when the user wants the work isolated from their current branch — not mandatory by default, since not every task needs it.
