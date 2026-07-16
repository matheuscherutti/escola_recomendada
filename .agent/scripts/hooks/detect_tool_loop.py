#!/usr/bin/env python3
"""
detect_tool_loop.py - Claude Code PostToolUse hook.
Advisory-only: mirrors the 2 mechanically-detectable rows of DEVBUREAU.md's
"Loop Detection Rules" table (ANTI-HALLUCINATION & LOOP PROTECTION section) -
"same tool called 3+ times with same args and same error" and "file edit
that fails 2+ times with target content mismatch". Deliberately does NOT
invent new thresholds (cost, "not advancing") that table doesn't already
state - those stay prose-only, self-monitored by the agent.
Uses _hook_state.py to compare the current call against this session's
recent history. Never blocks - only the agent decides to actually stop;
this hook just makes the signal hard to miss or rationalize away.
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().

VERIFY: the exact shape of `tool_response` on error is not confirmed against
a live payload capture - error detection below is a defensive best-effort
match across a few plausible shapes (dict with "error"/"is_error", or a
string containing common error markers). If this under- or over-fires in
practice, capture a real payload and tighten the match.
"""

import hashlib
import json
import sys

from _hook_state import append_call

LOOP_MATCHER_TOOLS = ("Edit", "Write", "MultiEdit", "Bash", "Grep", "Read")


def looks_like_error(tool_response) -> bool:
    if isinstance(tool_response, dict):
        if tool_response.get("is_error") is True:
            return True
        if "error" in tool_response:
            return True
        text = json.dumps(tool_response, default=str)
    elif isinstance(tool_response, str):
        text = tool_response
    else:
        return False
    lowered = text.lower()
    return "error" in lowered and (
        "no such" in lowered
        or "not found" in lowered
        or "failed" in lowered
        or "does not match" in lowered
        or "old_string" in lowered
    )


def signature(tool_input: dict) -> str:
    raw = json.dumps(tool_input, sort_keys=True, default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = payload.get("tool_name", "")
    if tool_name not in LOOP_MATCHER_TOOLS:
        sys.exit(0)

    session_id = payload.get("session_id", "unknown")
    tool_input = payload.get("tool_input", {})
    errored = looks_like_error(payload.get("tool_response"))

    record = {"tool": tool_name, "sig": signature(tool_input), "error": errored}
    history = append_call(session_id, record)

    if not errored:
        sys.exit(0)

    # "File edit that fails 2+ times with target content mismatch" - 2 most
    # recent calls are the same failing Edit.
    if tool_name == "Edit" and len(history) >= 2:
        last_two = history[-2:]
        if all(h["tool"] == "Edit" and h["error"] and h["sig"] == record["sig"] for h in last_two):
            print(
                "[Hook] This Edit has now failed 2x with the same target content - "
                "re-read the file before retrying (DEVBUREAU.md Loop Detection Rules).",
            )
            sys.exit(0)

    # "Same tool called 3+ times with same args and same error" - 3 most
    # recent calls share tool + args + errored status.
    if len(history) >= 3:
        last_three = history[-3:]
        if all(
            h["tool"] == record["tool"] and h["sig"] == record["sig"] and h["error"]
            for h in last_three
        ):
            print(
                f"[Hook] '{tool_name}' has now failed 3x in a row with identical "
                "arguments - STOP and declare the blocker instead of retrying "
                "(DEVBUREAU.md Loop Detection Rules).",
            )

    sys.exit(0)


if __name__ == "__main__":
    main()
