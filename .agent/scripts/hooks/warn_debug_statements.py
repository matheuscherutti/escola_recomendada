#!/usr/bin/env python3
"""
warn_debug_statements.py - Claude Code PostToolUse hook.
Advisory-only: warns when an edited/written JS/TS file still contains a
console.log(...) call, the most common leftover-debug-statement pattern.
Never blocks - just a nudge, same advisory-only design as scan_injection.py.
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
"""

import json
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

JS_TS_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx")
CONSOLE_LOG = re.compile(r"console\.log\s*\(")


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        sys.exit(0)

    file_path = payload.get("tool_input", {}).get("file_path", "")
    if not file_path or Path(file_path).suffix not in JS_TS_EXTENSIONS:
        sys.exit(0)

    try:
        content = Path(file_path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        sys.exit(0)

    matches = len(CONSOLE_LOG.findall(content))
    if matches == 0:
        sys.exit(0)

    print(
        f"[Hook] {Path(file_path).name} still has {matches} console.log() call(s) "
        "- remove debug statements before finishing the task (Clean Code: dead "
        "code must be removed, not commented).",
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
