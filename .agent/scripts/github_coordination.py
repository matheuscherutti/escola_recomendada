#!/usr/bin/env python3
"""
github_coordination.py - GitHub Issues-backed multi-agent work coordination.

Optional layer for /squad and /ade when work needs to survive across
multiple sessions/agents that don't share a disk (squad-forge's state.json
and /ade's {task-slug}.md ledger both assume one active runner on one
machine). Wraps the `gh` CLI - auth/API handling stays with `gh`, this
script never talks to GitHub's API directly (same precedent as the one
existing GitHub-Issues usage in the kit, codebase-audit's `--issues`
modifier: gh auth status -> gh repo view -> gh issue create).

Coordination state lives in the issue body as an HTML-comment JSON block
(never rendered on GitHub), not on local disk - GitHub IS the shared disk
here. Same status vocabulary as squad-forge's state.json for consistency
between the two mechanisms: running | awaiting-approval | blocked | done.

Usage: python .agent/scripts/github_coordination.py <subcommand> [args]
Subcommands: claim, decompose, validate, publish, review, unblock, sync
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = REPO_ROOT / ".agent" / ".tmp" / "epic-cache"

MARKER_START = "<!-- devbureau-coordination:"
MARKER_END = "-->"
VALID_STATUSES = ("running", "awaiting-approval", "blocked", "done")


def run_gh(args: list[str], input_text: str | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["gh", *args], capture_output=True, text=True, input=input_text
    )


def preflight(repo: str) -> None:
    auth = run_gh(["auth", "status"])
    if auth.returncode != 0:
        print("ERROR: gh is not authenticated - run `gh auth login` first.", file=sys.stderr)
        sys.exit(1)
    view = run_gh(["repo", "view", repo, "--json", "visibility"])
    if view.returncode != 0:
        print(f"ERROR: cannot access repo '{repo}' via gh: {view.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    visibility = json.loads(view.stdout).get("visibility", "UNKNOWN")
    if visibility == "PUBLIC":
        print(f"NOTE: '{repo}' is a public repo - coordination comments are publicly visible.")


def get_issue(repo: str, number: int) -> dict:
    result = run_gh(
        ["issue", "view", str(number), "--repo", repo, "--json", "title,body,labels,state"]
    )
    if result.returncode != 0:
        print(f"ERROR: cannot read issue #{number}: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def parse_coordination(body: str) -> dict:
    start = body.find(MARKER_START)
    if start == -1:
        return {"status": "running", "claimed_by": None, "depends_on": [], "review": None, "tasks": []}
    end = body.find(MARKER_END, start)
    if end == -1:
        return {"status": "running", "claimed_by": None, "depends_on": [], "review": None, "tasks": []}
    raw = body[start + len(MARKER_START) : end].strip()
    try:
        state = json.loads(raw)
    except json.JSONDecodeError:
        state = {}
    state.setdefault("status", "running")
    state.setdefault("claimed_by", None)
    state.setdefault("depends_on", [])
    state.setdefault("review", None)
    state.setdefault("tasks", [])
    return state


def write_coordination(repo: str, number: int, body: str, state: dict) -> bool:
    marker = f"{MARKER_START} {json.dumps(state)} {MARKER_END}"
    start = body.find(MARKER_START)
    if start == -1:
        new_body = body.rstrip() + "\n\n" + marker + "\n"
    else:
        end = body.find(MARKER_END, start) + len(MARKER_END)
        new_body = body[:start] + marker + body[end:]
    result = run_gh(
        ["issue", "edit", str(number), "--repo", repo, "--body-file", "-"],
        input_text=new_body,
    )
    return result.returncode == 0


def add_comment(repo: str, number: int, text: str) -> None:
    run_gh(["issue", "comment", str(number), "--repo", repo, "--body", text])


def cmd_claim(args: argparse.Namespace) -> None:
    preflight(args.repo)
    issue = get_issue(args.repo, args.issue)
    state = parse_coordination(issue["body"])
    if state["status"] not in ("running",) and state.get("claimed_by") not in (None, args.actor):
        print(f"ERROR: issue #{args.issue} already claimed by {state['claimed_by']}.", file=sys.stderr)
        sys.exit(1)
    state["status"] = "running"
    state["claimed_by"] = args.actor
    if not write_coordination(args.repo, args.issue, issue["body"], state):
        print("ERROR: failed to update issue body.", file=sys.stderr)
        sys.exit(1)
    add_comment(args.repo, args.issue, f"Claimed by {args.actor} (devbureau /epic-claim).")
    print(f"Claimed issue #{args.issue} for {args.actor}.")


def cmd_decompose(args: argparse.Namespace) -> None:
    preflight(args.repo)
    issue = get_issue(args.repo, args.issue)
    tasks = [
        line.strip("- [ ]").strip("- [x]").strip()
        for line in issue["body"].splitlines()
        if line.strip().startswith(("- [ ]", "- [x]"))
    ]
    state = parse_coordination(issue["body"])
    state["tasks"] = tasks
    if not write_coordination(args.repo, args.issue, issue["body"], state):
        print("ERROR: failed to update issue body.", file=sys.stderr)
        sys.exit(1)
    add_comment(args.repo, args.issue, f"Decomposed into {len(tasks)} task(s) (devbureau /epic-decompose).")
    print(f"Recorded {len(tasks)} task(s) from issue #{args.issue}'s checklist.")


def cmd_validate(args: argparse.Namespace) -> None:
    preflight(args.repo)
    issue = get_issue(args.repo, args.issue)
    state = parse_coordination(issue["body"])
    problems = []
    if not state.get("claimed_by"):
        problems.append("not claimed")
    for dep in state.get("depends_on", []):
        dep_issue = get_issue(args.repo, dep)
        if dep_issue["state"] != "CLOSED":
            problems.append(f"dependency #{dep} still open")
    if problems:
        print(f"NOT READY: {'; '.join(problems)}")
        sys.exit(1)
    print(f"Issue #{args.issue} is ready (claimed, all dependencies closed).")


def cmd_publish(args: argparse.Namespace) -> None:
    preflight(args.repo)
    issue = get_issue(args.repo, args.issue)
    state = parse_coordination(issue["body"])
    if not write_coordination(args.repo, args.issue, issue["body"], state):
        print("ERROR: failed to publish coordination state.", file=sys.stderr)
        sys.exit(1)
    add_comment(args.repo, args.issue, f"Coordination state published: status={state['status']} (devbureau /epic-publish).")
    print(f"Published current coordination state for issue #{args.issue}.")


def cmd_review(args: argparse.Namespace) -> None:
    preflight(args.repo)
    issue = get_issue(args.repo, args.issue)
    state = parse_coordination(issue["body"])
    state["review"] = args.review
    if not write_coordination(args.repo, args.issue, issue["body"], state):
        print("ERROR: failed to update review state.", file=sys.stderr)
        sys.exit(1)
    add_comment(args.repo, args.issue, f"Review: {args.review} (devbureau /epic-review).")
    print(f"Recorded review '{args.review}' on issue #{args.issue}.")


def cmd_unblock(args: argparse.Namespace) -> None:
    preflight(args.repo)
    result = run_gh(["issue", "list", "--repo", args.repo, "--label", "blocked", "--json", "number,body"])
    if result.returncode != 0:
        print(f"ERROR: cannot list issues: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    unblocked = []
    for entry in json.loads(result.stdout):
        state = parse_coordination(entry["body"])
        deps = state.get("depends_on", [])
        if deps and all(get_issue(args.repo, d)["state"] == "CLOSED" for d in deps):
            state["status"] = "running"
            write_coordination(args.repo, entry["number"], entry["body"], state)
            add_comment(args.repo, entry["number"], "Unblocked - all dependencies closed (devbureau /epic-unblock).")
            unblocked.append(entry["number"])
    print(f"Unblocked {len(unblocked)} issue(s): {unblocked}" if unblocked else "No issues unblocked.")


def cmd_sync(args: argparse.Namespace) -> None:
    preflight(args.repo)
    result = run_gh(["issue", "list", "--repo", args.repo, "--label", "devbureau-epic", "--json", "number,title,state,body"])
    if result.returncode != 0:
        print(f"ERROR: cannot list issues: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    issues = json.loads(result.stdout)
    snapshot = [
        {**{k: v for k, v in entry.items() if k != "body"}, "coordination": parse_coordination(entry["body"])}
        for entry in issues
    ]
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{args.repo.replace('/', '_')}.json"
    cache_file.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    print(f"Synced {len(snapshot)} epic issue(s) from '{args.repo}' -> {cache_file}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    for name, needs_issue in (
        ("claim", True), ("decompose", True), ("validate", True),
        ("publish", True), ("review", True),
    ):
        p = sub.add_parser(name)
        if needs_issue:
            p.add_argument("issue", type=int)
        p.add_argument("--repo", required=True)
        if name == "claim":
            p.add_argument("--actor", required=True)
        if name == "review":
            p.add_argument("--review", required=True, choices=("requested", "approved", "changes-requested"))

    for name in ("unblock", "sync"):
        p = sub.add_parser(name)
        p.add_argument("--repo", required=True)

    args = parser.parse_args()
    handlers = {
        "claim": cmd_claim, "decompose": cmd_decompose, "validate": cmd_validate,
        "publish": cmd_publish, "review": cmd_review, "unblock": cmd_unblock, "sync": cmd_sync,
    }
    handlers[args.command](args)


if __name__ == "__main__":
    main()
