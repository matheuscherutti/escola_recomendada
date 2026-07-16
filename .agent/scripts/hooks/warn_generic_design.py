#!/usr/bin/env python3
"""
warn_generic_design.py - Claude Code PostToolUse hook.
Advisory-only: warns when an edited/written frontend file uses a banned
color family (purple/violet/indigo/magenta as primary/brand color) or
imports a banned default UI library (shadcn/ui, Radix, Chakra, MUI).
Never blocks - a hook can't know if the user explicitly asked for purple
or a specific library (frontend-specialist.md's own exception clause),
so this is a nudge, same advisory-only design as warn_debug_statements.py.
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
Reinforces .agent/agents/frontend-specialist.md's "PURPLE IS FORBIDDEN" and
"NO DEFAULT UI LIBRARIES" sections - previously prose-only, self-policed by
the agent with no deterministic check.
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

FRONTEND_EXTENSIONS = (".css", ".scss", ".tsx", ".jsx", ".html", ".vue")

# Named-color family match: Tailwind utility classes (bg-purple-600,
# text-violet-500, from-indigo-400, ring-fuchsia-...) and raw CSS/JSX color
# keywords. Word-boundary so "purple" isn't matched inside an unrelated
# identifier, but still catches "purple-600", "Purple", etc.
BANNED_COLOR_FAMILY = re.compile(
    r"\b(purple|violet|indigo|magenta)(?:-\d{2,3})?\b", re.IGNORECASE
)

BANNED_UI_IMPORTS = re.compile(
    r"""from\s+["']@radix-ui/|from\s+["']@chakra-ui/|from\s+["']@mui/"""
    r"""|from\s+["']@material-ui/|from\s+["']@/components/ui/""",
)


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        sys.exit(0)

    file_path = payload.get("tool_input", {}).get("file_path", "")
    if not file_path or Path(file_path).suffix not in FRONTEND_EXTENSIONS:
        sys.exit(0)

    try:
        content = Path(file_path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        sys.exit(0)

    findings = []

    color_hits = sorted({m.group(0).lower() for m in BANNED_COLOR_FAMILY.finditer(content)})
    if color_hits:
        findings.append(
            f"banned color family ({', '.join(color_hits)}) - Purple Ban in "
            "frontend-specialist.md forbids these as primary/brand color unless "
            "explicitly requested by the user"
        )

    if BANNED_UI_IMPORTS.search(content):
        findings.append(
            "default UI library import (shadcn/Radix/Chakra/MUI) - "
            "frontend-specialist.md requires asking the user before using one"
        )

    if not findings:
        sys.exit(0)

    print(
        f"[Hook] {Path(file_path).name}: {'; '.join(findings)}. "
        "If this was explicitly requested, ignore this warning.",
    )
    sys.exit(0)


if __name__ == "__main__":
    main()
