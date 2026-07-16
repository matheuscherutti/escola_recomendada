#!/usr/bin/env python3
"""
check_mcp_health.py - Claude Code hook, registered for BOTH PreToolUse and
PostToolUse on the "mcp__.*" matcher (branches on `hook_event_name`).
Advisory-only: tracks consecutive failures per MCP server (parsed from the
"mcp__<server>__<tool>" naming convention) via _hook_state.py, and warns
before a call if that server has failed 3+ times in a row recently. Never
blocks - a single transient failure (auth not yet completed, brief network
blip) shouldn't stop the agent from trying an MCP call; this just surfaces
a pattern that's easy to miss across a long session.
Registered in .claude/settings.json by sync_ide.py's generate_claude_config().
"""

import json
import sys

from _hook_state import append_call, load_history

CONSECUTIVE_FAILURE_THRESHOLD = 3


def server_name(tool_name: str) -> str:
    parts = tool_name.split("__")
    return parts[1] if len(parts) >= 2 else tool_name


def looks_like_failure(tool_response) -> bool:
    if isinstance(tool_response, dict):
        if tool_response.get("is_error") is True or "error" in tool_response:
            return True
        text = json.dumps(tool_response, default=str)
    elif isinstance(tool_response, str):
        text = tool_response
    else:
        return False
    lowered = text.lower()
    return any(
        marker in lowered
        for marker in ("unauthorized", "unauthenticated", "connection refused",
                        "timed out", "timeout", "server error", "unavailable")
    )


def main() -> None:
    try:
        payload = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = payload.get("tool_name", "")
    if not tool_name.startswith("mcp__"):
        sys.exit(0)

    session_id = payload.get("session_id", "unknown")
    server = server_name(tool_name)
    event = payload.get("hook_event_name", "")

    if event == "PostToolUse":
        failed = looks_like_failure(payload.get("tool_response"))
        append_call(session_id, {"tool": "mcp", "server": server, "error": failed})
        sys.exit(0)

    # PreToolUse: warn if this server's last N calls were all failures.
    history = [h for h in load_history(session_id) if h.get("server") == server]
    if len(history) >= CONSECUTIVE_FAILURE_THRESHOLD:
        recent = history[-CONSECUTIVE_FAILURE_THRESHOLD:]
        if all(h.get("error") for h in recent):
            print(
                f"[Hook] MCP server '{server}' has failed {CONSECUTIVE_FAILURE_THRESHOLD}x "
                "in a row recently - check auth/connection before retrying, or switch "
                "approach instead of calling it again unchanged.",
            )

    sys.exit(0)


if __name__ == "__main__":
    main()
