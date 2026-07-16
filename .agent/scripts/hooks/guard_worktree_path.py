#!/usr/bin/env python3
"""
guard_worktree_path.py - Claude Code PreToolUse hook.
Blocks Edit/Write/MultiEdit calls that target an absolute path outside the
current git worktree root. The prose guard in using-git-worktrees (SKILL.md)
is never enforced if the agent under load forgets it - this hook makes the
constraint hard-blocking instead of advisory.
No-op outside a worktree (a normal repo checkout has no separate root to
violate), and no-op for relative paths (already scoped to cwd).
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
"""

import json
import subprocess
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass


def git_toplevel(cwd: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=2,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def is_worktree(cwd: str) -> bool:
    """A linked worktree has a `.git` FILE pointing elsewhere; the main
    checkout has a `.git` DIRECTORY. This distinguishes the two without
    depending on git version-specific flags."""
    git_path = Path(cwd) / ".git"
    return git_path.is_file()


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    file_path = payload.get("tool_input", {}).get("file_path", "")
    cwd = payload.get("cwd", "")
    if not file_path or not cwd or not Path(file_path).is_absolute():
        sys.exit(0)

    if not is_worktree(cwd):
        sys.exit(0)

    toplevel = git_toplevel(cwd)
    if not toplevel:
        sys.exit(0)

    try:
        Path(file_path).resolve().relative_to(Path(toplevel).resolve())
    except ValueError:
        print(
            f"Blocked: '{file_path}' is outside the current worktree "
            f"('{toplevel}'). The executor must only touch files inside its "
            f"own isolated worktree - see using-git-worktrees skill.",
            file=sys.stderr,
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
