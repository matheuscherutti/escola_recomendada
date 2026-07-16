#!/usr/bin/env python3
"""
token_footprint.py — DevBureau Context Footprint Checker
Measures how many tokens the kit's own generated rule files cost, so growth
in agents/skills doesn't silently bloat what gets injected into every session.
Usage: python .agent/scripts/token_footprint.py
"""

import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

REPO_ROOT = Path(__file__).resolve().parents[2]

# chars-per-token is a rough, widely-cited heuristic for English/code text —
# good enough to spot a growth trend, not meant to match a provider's billing.
CHARS_PER_TOKEN = 4
WARN_THRESHOLD_TOKENS = 10_000

GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

# Files/dirs DevBureau injects into a session every time the host IDE loads
# its rules — these are the ones worth watching for growth, not arbitrary
# project files.
WATCHED: dict[str, list[str]] = {
    "Source (read by every IDE target)": [".agent/rules/DEVBUREAU.md"],
    "Claude Code": [".claude/CLAUDE.md"],
    "Antigravity / Gemini CLI": ["GEMINI.md"],
    "Codex CLI / OpenCode": ["AGENTS.md"],
    "GitHub Copilot": [
        ".github/copilot-instructions.md",
        ".github/instructions/code-quality.instructions.md",
        ".github/instructions/frontend.instructions.md",
        ".github/instructions/backend.instructions.md",
        ".github/instructions/security.instructions.md",
    ],
    "Cursor": [
        ".cursor/rules/00-core.mdc",
        ".cursor/rules/code-quality.mdc",
        ".cursor/rules/security.mdc",
        ".cursor/rules/frontend.mdc",
        ".cursor/rules/backend.mdc",
    ],
    "Windsurf": [".windsurfrules"],
    "Cline": [".clinerules"],
    "Roo Code": [".roorules"],
}


def approx_tokens(char_count: int) -> int:
    return char_count // CHARS_PER_TOKEN


def measure(relative_path: str) -> tuple[int, int] | None:
    path = REPO_ROOT / relative_path
    if not path.exists():
        return None
    content = path.read_text(encoding="utf-8", errors="ignore")
    return len(content), approx_tokens(len(content))


def main() -> None:
    print(f"\n{BOLD}🪶 DevBureau — Context Footprint{RESET}")
    print("─" * 60)
    print(f"(approximate: {CHARS_PER_TOKEN} chars/token, not an exact tokenizer)")

    total_tokens_per_target: dict[str, int] = {}

    for group, paths in WATCHED.items():
        print(f"\n{CYAN}{BOLD}{group}{RESET}")
        group_tokens = 0
        any_found = False
        for relative_path in paths:
            result = measure(relative_path)
            if result is None:
                print(f"  {YELLOW}—{RESET} {relative_path} (not generated yet)")
                continue
            any_found = True
            chars, tokens = result
            group_tokens += tokens
            print(f"  {GREEN}✔{RESET} {relative_path}: {chars:,} chars ≈ {tokens:,} tokens")
        if any_found:
            total_tokens_per_target[group] = group_tokens
            flag = f" {YELLOW}⚠ over {WARN_THRESHOLD_TOKENS:,} tokens{RESET}" if group_tokens > WARN_THRESHOLD_TOKENS else ""
            print(f"  {BOLD}Total: ≈ {group_tokens:,} tokens{flag}{RESET}")

    print(f"\n{'─' * 60}")
    if not total_tokens_per_target:
        print(f"\n{YELLOW}No generated rule files found. Run `python .agent/scripts/sync_ide.py --target all` first.{RESET}\n")
        return

    largest_group = max(total_tokens_per_target, key=total_tokens_per_target.get)
    print(f"\nLargest footprint: {BOLD}{largest_group}{RESET} (≈ {total_tokens_per_target[largest_group]:,} tokens)")
    print("Every token here is paid on every session before any work starts — re-run after adding agents/skills to watch the trend.\n")


if __name__ == "__main__":
    main()
