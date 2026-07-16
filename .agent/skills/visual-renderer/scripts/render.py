#!/usr/bin/env python3
"""Renders self-contained HTML/CSS files to PNG at an exact viewport via headless Chromium.
Usage:
    python render.py --html file.html --output file.png --width 1080 --height 1440
    python render.py --html-dir slides/ --output-dir slides/ --width 1080 --height 1440
"""
import argparse
import sys
from pathlib import Path


def render_one(playwright, html_path: Path, output_path: Path, width: int, height: int) -> None:
    browser = playwright.chromium.launch()
    try:
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(html_path.resolve().as_uri())
        page.wait_for_load_state("networkidle")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(output_path))
    finally:
        browser.close()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html", help="Single HTML file to render")
    parser.add_argument("--output", help="Output PNG path (single mode)")
    parser.add_argument("--html-dir", help="Directory of .html files (batch mode)")
    parser.add_argument("--output-dir", help="Output directory for batch mode")
    parser.add_argument("--width", type=int, required=True)
    parser.add_argument("--height", type=int, required=True)
    args = parser.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright not installed. Run: pip install playwright && python -m playwright install chromium", file=sys.stderr)
        return 1

    with sync_playwright() as p:
        if args.html:
            if not args.output:
                print("ERROR: --output is required with --html", file=sys.stderr)
                return 1
            html_path = Path(args.html)
            if not html_path.exists():
                print(f"ERROR: {html_path} not found", file=sys.stderr)
                return 1
            render_one(p, html_path, Path(args.output), args.width, args.height)
            print(f"Rendered: {args.output}")
        elif args.html_dir:
            html_dir = Path(args.html_dir)
            out_dir = Path(args.output_dir or args.html_dir)
            html_files = sorted(html_dir.glob("*.html"))
            if not html_files:
                print(f"ERROR: no .html files in {html_dir}", file=sys.stderr)
                return 1
            for html_path in html_files:
                output_path = out_dir / (html_path.stem + ".png")
                render_one(p, html_path, output_path, args.width, args.height)
                print(f"Rendered: {output_path}")
        else:
            print("ERROR: provide either --html or --html-dir", file=sys.stderr)
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
