#!/usr/bin/env python3
"""
auto_fix_on_edit.py - Claude Code PostToolUse hook.
Automatically runs auto_fixer.py on the file that was just edited or written.
Advisory-only: never blocks, fails silently if tools are unavailable.
Skips .agent/ meta files and files outside recognized code extensions.
"""

import json
import subprocess
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

CODE_EXTENSIONS = {".py", ".ts", ".tsx", ".js", ".jsx", ".css", ".scss"}


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        sys.exit(0)

    file_path = payload.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)

    path = Path(file_path)

    # Skip .agent/ kit meta files — they are managed by sync_ide.py, not formatters
    try:
        if ".agent" in path.parts:
            sys.exit(0)
    except Exception:
        sys.exit(0)

    if path.suffix not in CODE_EXTENSIONS:
        sys.exit(0)

    if not path.exists():
        sys.exit(0)

    auto_fixer = Path(__file__).parent.parent / "auto_fixer.py"
    if not auto_fixer.exists():
        sys.exit(0)

    try:
        subprocess.run(
            [sys.executable, str(auto_fixer), str(file_path)],
            capture_output=True,
            timeout=30,
        )
    except Exception:
        pass

    sys.exit(0)


if __name__ == "__main__":
    main()
