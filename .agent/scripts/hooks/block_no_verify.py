#!/usr/bin/env python3
"""
block_no_verify.py - Claude Code PreToolUse hook.
Blocks git commands that bypass commit/push hooks via --no-verify or
-c core.hooksPath=<path>. CLAUDE.md's Git Safety Protocol already says
"NEVER skip hooks (--no-verify...) unless the user explicitly requests it"
but nothing enforced that until now - this hook makes it hard-blocking
instead of advisory.
No-op for any Bash command that isn't a git invocation.
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
"""

import json
import re
import sys

if sys.platform == "win32":
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

GIT_INVOCATION = re.compile(r"(?:^|[;&|]|\s)git(?:\s|$)")
NO_VERIFY_FLAG = re.compile(r"(?:^|\s)--no-verify(?:\s|$)")
HOOKS_PATH_OVERRIDE = re.compile(r"-c\s+core\.hookspath=", re.IGNORECASE)

HEREDOC_BODY = re.compile(r"<<[-~]?\s*['\"]?(\w+)['\"]?.*?\n\1\b", re.DOTALL)
SINGLE_QUOTED = re.compile(r"'[^']*'")
DOUBLE_QUOTED = re.compile(r'"[^"]*"')


def strip_quoted_regions(command: str) -> str:
    """Drop heredoc bodies and quoted-string contents before pattern matching,
    so a commit message that merely *mentions* --no-verify (e.g. describing
    this very hook) doesn't trip the check. Best-effort, not a full shell
    parser - nested/escaped quotes inside a heredoc can still confuse it."""
    command = HEREDOC_BODY.sub("", command)
    command = SINGLE_QUOTED.sub("''", command)
    command = DOUBLE_QUOTED.sub('""', command)
    return command


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    if payload.get("tool_name") != "Bash":
        sys.exit(0)

    raw_command = payload.get("tool_input", {}).get("command", "")
    if not raw_command:
        sys.exit(0)

    command = strip_quoted_regions(raw_command)
    if not GIT_INVOCATION.search(command):
        sys.exit(0)

    if HOOKS_PATH_OVERRIDE.search(command):
        print(
            "Blocked: 'git -c core.hooksPath=...' bypasses the repo's configured "
            "hooks. CLAUDE.md's Git Safety Protocol forbids skipping hooks unless "
            "the user explicitly asked for it.",
            file=sys.stderr,
        )
        sys.exit(2)

    if NO_VERIFY_FLAG.search(command):
        print(
            "Blocked: '--no-verify' skips the repo's pre-commit/pre-push hooks. "
            "CLAUDE.md's Git Safety Protocol forbids this unless the user "
            "explicitly asked for it - if a hook is failing, fix the underlying "
            "issue instead of bypassing it.",
            file=sys.stderr,
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
