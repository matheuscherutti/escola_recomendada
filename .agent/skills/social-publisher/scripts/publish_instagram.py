#!/usr/bin/env python3
"""Publishes an Instagram carousel post via the Graph API from already-hosted image URLs.
Requires INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID (env or .env file).
Usage:
    python publish_instagram.py --images "url1,url2,..." --caption "..." [--dry-run]
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

GRAPH_API = "https://graph.facebook.com/v21.0"
MAX_CAPTION_CHARS = 2200
MIN_IMAGES, MAX_IMAGES = 2, 10


def load_env_file() -> None:
    env_path = Path(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if "=" not in line or line.strip().startswith("#"):
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def graph_post(path: str, params: dict, token: str) -> dict:
    params = {**params, "access_token": token}
    req = urllib.request.Request(
        f"{GRAPH_API}/{path}",
        data=urllib.parse.urlencode(params).encode("utf-8"),
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"ERROR: Graph API {exc.code}: {body}", file=sys.stderr)
        sys.exit(1)


def graph_get(path: str, params: dict, token: str) -> dict:
    query = urllib.parse.urlencode({**params, "access_token": token})
    with urllib.request.urlopen(f"{GRAPH_API}/{path}?{query}", timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def wait_until_ready(container_id: str, token: str, timeout_s: int = 60) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        status = graph_get(container_id, {"fields": "status_code"}, token).get("status_code")
        if status == "FINISHED":
            return
        if status == "ERROR":
            print(f"ERROR: container {container_id} failed processing", file=sys.stderr)
            sys.exit(1)
        time.sleep(2)
    print(f"ERROR: container {container_id} did not finish processing within {timeout_s}s", file=sys.stderr)
    sys.exit(1)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--images", required=True, help="Comma-separated public image URLs (2-10 JPEGs)")
    parser.add_argument("--caption", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    load_env_file()
    token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    user_id = os.environ.get("INSTAGRAM_USER_ID")
    if not token or not user_id:
        print("ERROR: INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID must be set", file=sys.stderr)
        return 1

    image_urls = [u.strip() for u in args.images.split(",") if u.strip()]
    if not (MIN_IMAGES <= len(image_urls) <= MAX_IMAGES):
        print(f"ERROR: carousel needs {MIN_IMAGES}-{MAX_IMAGES} images, got {len(image_urls)}", file=sys.stderr)
        return 1
    if len(args.caption) > MAX_CAPTION_CHARS:
        print(f"ERROR: caption is {len(args.caption)} chars, max is {MAX_CAPTION_CHARS}", file=sys.stderr)
        return 1

    if args.dry_run:
        print(f"DRY RUN: would publish {len(image_urls)} images with caption ({len(args.caption)} chars)")
        for url in image_urls:
            print(f"  - {url}")
        return 0

    child_ids = []
    for url in image_urls:
        result = graph_post(f"{user_id}/media", {"image_url": url, "is_carousel_item": "true"}, token)
        child_ids.append(result["id"])
        print(f"Container created: {result['id']}")

    carousel = graph_post(
        f"{user_id}/media",
        {"media_type": "CAROUSEL", "children": ",".join(child_ids), "caption": args.caption},
        token,
    )
    container_id = carousel["id"]
    wait_until_ready(container_id, token)

    published = graph_post(f"{user_id}/media_publish", {"creation_id": container_id}, token)
    media_id = published["id"]
    permalink = graph_post(f"{media_id}", {"fields": "permalink"}, token)

    print(f"Published: {permalink.get('permalink', '(permalink unavailable)')}")
    print(f"Media ID: {media_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
