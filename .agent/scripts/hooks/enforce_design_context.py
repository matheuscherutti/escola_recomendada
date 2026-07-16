#!/usr/bin/env python3
"""
enforce_design_context.py - Claude Code PreToolUse hook.
BLOCKING: enforces DEVBUREAU.md's Agent Routing Checklist for design work -
"READ the agent's .md file before ANY code or design response". Before an
Edit/Write/MultiEdit on a frontend/mobile UI file, it checks the session
transcript for evidence that the relevant specialist agent (or its design
skill) was actually Read this session. If not, it blocks with exit code 2;
the stderr message tells the agent exactly which file to read, so the very
next attempt passes. Self-correcting by design: the cost of a false positive
is one Read of a file the P0 rules already mandate reading.

Unlike warn_generic_design.py (advisory - it can't know if the user asked
for purple), this rule has no user-intent exception: reading the specialist
agent before frontend work is unconditional in DEVBUREAU.md, so blocking is
safe. Fails open on any uncertainty (no transcript, unreadable file, or a
project without the .agent structure).

Evidence matching is against the transcript's Read tool_use records
("file_path": "...frontend-specialist.md"), NOT bare filename substrings -
otherwise this hook's own block message appearing in the transcript would
count as evidence and the gate would open itself after one denial.

Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
"""

import json
import re
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

WEB_EXTENSIONS = (".css", ".scss", ".tsx", ".jsx", ".vue", ".html")
MOBILE_EXTENSIONS = (".dart",)
UI_EXTENSIONS = WEB_EXTENSIONS + MOBILE_EXTENSIONS

# A Read of ANY of these counts as having loaded design context this session.
# Matched inside a JSON "file_path" value so plain-text mentions (including
# this hook's own block message) can never satisfy the check.
EVIDENCE_FILES = (
    "frontend-specialist.md",
    "mobile-developer.md",
    "frontend-design/SKILL.md",
    "mobile-design/SKILL.md",
)

EVIDENCE_PATTERN = re.compile(
    r'"file_path"\s*:\s*"[^"]*(?:'
    + "|".join(re.escape(name).replace("/", r"[/\\\\]+") for name in EVIDENCE_FILES)
    + r')"'
)


def transcript_has_design_read(transcript_path: str) -> bool:
    try:
        content = Path(transcript_path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return True  # fail open: no transcript, no enforcement
    return bool(EVIDENCE_PATTERN.search(content))


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    if payload.get("tool_name") not in ("Edit", "Write", "MultiEdit"):
        sys.exit(0)

    file_path = payload.get("tool_input", {}).get("file_path", "")
    if not file_path or Path(file_path).suffix not in UI_EXTENSIONS:
        sys.exit(0)

    # Only enforce in projects that actually carry the devbureau agent layer.
    project_root = Path(payload.get("cwd", "."))
    agents_dir = project_root / ".agent" / "agents"
    if not (agents_dir / "frontend-specialist.md").exists():
        sys.exit(0)

    # The kit's own agent/skill sources are edited as prose, not as UI code -
    # never gate the kit maintaining itself.
    normalized = str(Path(file_path)).replace("\\", "/")
    if "/.agent/" in normalized or "/.claude/" in normalized:
        sys.exit(0)

    transcript_path = payload.get("transcript_path", "")
    if not transcript_path or transcript_has_design_read(transcript_path):
        sys.exit(0)

    is_mobile = Path(file_path).suffix in MOBILE_EXTENSIONS
    agent_file = (
        ".agent/agents/mobile-developer.md" if is_mobile else ".agent/agents/frontend-specialist.md"
    )
    print(
        f"[Hook] Blocked: {Path(file_path).name} is a UI file, but no specialist "
        "design context was loaded this session (DEVBUREAU.md Agent Routing "
        f"Checklist, step 2). Read {agent_file} (and the design skills its "
        "frontmatter lists) first, then retry this exact edit - it will pass.",
        file=sys.stderr,
    )
    sys.exit(2)


if __name__ == "__main__":
    main()
