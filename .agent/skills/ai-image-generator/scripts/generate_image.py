#!/usr/bin/env python3
"""Generates images via OpenRouter's image-capable chat models.
Usage:
    python generate_image.py --prompt "..." --output out.jpg --mode test
    python generate_image.py --prompt "..." --output out.jpg --reference logo.png --mode production
    python generate_image.py --batch batch.json --mode production
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.request
from pathlib import Path

MODELS = {
    "test": "sourceful/riverflow-v2-fast",
    "production": "google/gemini-3.1-flash-image-preview",
}
API_URL = "https://openrouter.ai/api/v1/chat/completions"


def load_env_file() -> None:
    env_path = Path(".env")
    if not env_path.exists() or os.environ.get("OPENROUTER_API_KEY"):
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.strip().startswith("OPENROUTER_API_KEY="):
            os.environ["OPENROUTER_API_KEY"] = line.split("=", 1)[1].strip()


def build_content(prompt: str, reference: str | None) -> list[dict]:
    content = [{"type": "text", "text": prompt}]
    if reference:
        ref_path = Path(reference)
        mime, _ = mimetypes.guess_type(str(ref_path))
        data = base64.b64encode(ref_path.read_bytes()).decode("ascii")
        content.append({
            "type": "image_url",
            "image_url": {"url": f"data:{mime or 'image/png'};base64,{data}"},
        })
    return content


def generate_one(api_key: str, model: str, prompt: str, output: str, reference: str | None) -> bool:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": build_content(prompt, reference)}],
        "modalities": ["image", "text"],
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        print(f"ERROR: API returned {exc.code}: {exc.read().decode('utf-8', errors='replace')}", file=sys.stderr)
        return False

    images = body.get("choices", [{}])[0].get("message", {}).get("images", [])
    if not images:
        print(f"ERROR: no image in response (model={model})", file=sys.stderr)
        return False

    image_url = images[0].get("image_url", {}).get("url", "")
    if not image_url.startswith("data:"):
        print("ERROR: unexpected image_url format in response", file=sys.stderr)
        return False

    _, b64data = image_url.split(",", 1)
    out_path = Path(output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(base64.b64decode(b64data))
    print(f"Generated: {output}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt")
    parser.add_argument("--output")
    parser.add_argument("--reference")
    parser.add_argument("--batch")
    parser.add_argument("--mode", choices=["test", "production"], default="test")
    args = parser.parse_args()

    load_env_file()
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("ERROR: OPENROUTER_API_KEY not set (env var or .env file)", file=sys.stderr)
        return 1

    model = MODELS[args.mode]

    if args.batch:
        items = json.loads(Path(args.batch).read_text(encoding="utf-8"))
        ok = sum(
            generate_one(api_key, model, item["prompt"], item["output"], item.get("reference"))
            for item in items
        )
        print(f"Batch complete: {ok}/{len(items)} succeeded")
        return 0 if ok == len(items) else 1

    if not args.prompt or not args.output:
        print("ERROR: --prompt and --output are required (or use --batch)", file=sys.stderr)
        return 1

    return 0 if generate_one(api_key, model, args.prompt, args.output, args.reference) else 1


if __name__ == "__main__":
    sys.exit(main())
