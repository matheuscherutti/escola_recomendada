#!/usr/bin/env python3
"""
_hook_state.py - shared helper for Claude Code hooks that need to compare
the current tool call against recent history (loop detection, MCP health).
Not a hook itself (leading underscore, not registered in .claude/settings.json).

State is a small per-session JSON file, capped to the last MAX_HISTORY calls,
written to .agent/.tmp/hook-state/<session_id>.json (gitignored - runtime
scratch, not kit source). Best-effort: any read/write failure degrades to an
empty history rather than raising, since a stateful hook failing to persist
should never block or crash the tool call it's observing.
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
STATE_DIR = REPO_ROOT / ".agent" / ".tmp" / "hook-state"
MAX_HISTORY = 10


def _state_path(session_id: str) -> Path:
    safe_id = "".join(c for c in session_id if c.isalnum() or c in ("-", "_")) or "unknown"
    return STATE_DIR / f"{safe_id}.json"


def load_history(session_id: str) -> list[dict]:
    path = _state_path(session_id)
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data.get("calls", []) if isinstance(data, dict) else []
    except (OSError, json.JSONDecodeError):
        return []


def append_call(session_id: str, record: dict) -> list[dict]:
    """Append `record` to this session's history, capped to MAX_HISTORY, and
    return the updated (already-capped) history list."""
    history = load_history(session_id)
    history.append(record)
    history = history[-MAX_HISTORY:]
    try:
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        _state_path(session_id).write_text(
            json.dumps({"calls": history}), encoding="utf-8"
        )
    except OSError:
        pass
    return history
