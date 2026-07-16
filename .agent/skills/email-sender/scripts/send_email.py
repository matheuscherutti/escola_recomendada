#!/usr/bin/env python3
"""Sends email via the Resend HTTP API.
Usage:
    python send_email.py --from a@x.com --to b@y.com --subject "..." --html body.html
    python send_email.py --from a@x.com --to b@y.com --subject "..." --text "plain body"
    python send_email.py --batch emails.json
    (add --scheduled-at "2026-08-01T09:00:00Z" for a scheduled send)
"""
import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

API_URL = "https://api.resend.com/emails"


def load_env_file() -> None:
    env_path = Path(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" not in line or line.strip().startswith("#"):
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def send_one(api_key: str, payload: dict) -> bool:
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"ERROR: Resend API {exc.code}: {exc.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        return False

    if "id" not in body:
        print(f"ERROR: no id in response, send may have failed: {body}", file=sys.stderr)
        return False

    print(f"Sent: {body['id']} (to={payload['to']})")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from", dest="from_", help="Sender address (must be a verified domain)")
    parser.add_argument("--to")
    parser.add_argument("--subject")
    parser.add_argument("--html", help="Path to an HTML file for the body")
    parser.add_argument("--text", help="Plain-text body (inline)")
    parser.add_argument("--scheduled-at", help="ISO 8601 datetime for a scheduled send")
    parser.add_argument("--batch", help="Path to a JSON array of email objects")
    args = parser.parse_args()

    load_env_file()
    api_key = os.environ.get("RESEND_API_KEY")
    if not api_key:
        print("ERROR: RESEND_API_KEY not set (env var or .env file)", file=sys.stderr)
        return 1

    if args.batch:
        items = json.loads(Path(args.batch).read_text(encoding="utf-8"))
        ok = sum(send_one(api_key, item) for item in items)
        print(f"Batch complete: {ok}/{len(items)} succeeded")
        return 0 if ok == len(items) else 1

    if not (args.from_ and args.to and args.subject and (args.html or args.text)):
        print("ERROR: --from, --to, --subject, and --html or --text are required", file=sys.stderr)
        return 1

    payload = {"from": args.from_, "to": args.to, "subject": args.subject}
    payload["html"] = Path(args.html).read_text(encoding="utf-8") if args.html else None
    if args.text:
        payload["text"] = args.text
    payload = {k: v for k, v in payload.items() if v is not None}
    if args.scheduled_at:
        payload["scheduled_at"] = args.scheduled_at

    return 0 if send_one(api_key, payload) else 1


if __name__ == "__main__":
    sys.exit(main())
