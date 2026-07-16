---
name: social-publisher
description: "Use when content is ready to go live on social media — publish or schedule a post, carousel, or story. Triggers: 'publish this on Instagram', 'publica esse carrossel', 'agenda esse post', 'posta no Instagram/LinkedIn'. Covers a native, free path (Instagram Graph API, direct) and a paid multi-platform aggregator path (for LinkedIn/X/TikTok/YouTube without coding each API). ALWAYS a checkpoint before calling — publishing is irreversible and visible to the client's audience (Matriz de Decisão)."
allowed-tools: Read, Write, Bash, AskUserQuestion
---

# Social Publisher

Publishes approved content to social platforms. Adapted from
[renatoasse/opensquad](https://github.com/renatoasse/opensquad) (MIT).

## Hard rule — this is always a checkpoint

Publishing puts content live in front of the client's real audience and cannot be silently
undone (deleting a live post is visible and looks unprofessional). Per DEVBUREAU.md's
Matriz de Decisão, **get explicit approval of the exact images/copy immediately before
calling any publish operation** — regardless of the squad's checkpoint mode.

## Path 1 — Instagram, native (free, direct API)

Use when the client's audience is Instagram-only and you want no recurring third-party
subscription. Handles image hosting, media container creation, and publishing via the
Graph API directly.

### Setup (one-time, per client)
1. Instagram Business account connected to a Facebook Page.
2. Create an app at [developers.facebook.com](https://developers.facebook.com/) (type:
   Business).
3. Get a long-lived access token (Graph API Explorer → generate token with
   `instagram_content_publish`, `instagram_basic`, `pages_read_engagement` → exchange for
   60-day token via `GET /oauth/access_token?grant_type=fb_exchange_token&...`).
4. Get the Instagram User ID: `GET /me/accounts` → find the Page → `GET
   /{page-id}?fields=instagram_business_account`.
5. Set `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` in `.env`. Images need a temporary
   public URL for the Graph API to fetch — either an existing CDN/hosting the client
   already has, or a throwaway image host (document which one is used per client; do not
   assume imgBB or any single provider).

### Publish
The Graph API needs PUBLIC image URLs (it fetches them, it does not accept file uploads).
Host the rendered JPEGs somewhere reachable first (the client's own site/CDN if they have
one; otherwise a throwaway image host — pick one explicitly per client, do not assume a
provider), then pass the URLs:
```bash
python .agent/skills/social-publisher/scripts/publish_instagram.py \
  --images "https://.../slide-01.jpg,https://.../slide-02.jpg,...(2-10 JPEGs)" \
  --caption "Hook text + value + CTA, max 2200 chars" \
  --dry-run
```
Run once with `--dry-run` to validate the full flow without publishing, then without the
flag once approved. On success, the script prints the live post URL — save it to the
squad's `output/` for the handoff record. On failure, surface the exact error; do not retry
silently (rate limit is 25 API-published posts / 24h).

## Path 2 — Multi-platform aggregator (optional, paid)

For LinkedIn, X/Twitter, TikTok, YouTube — coding each platform's native API individually
is a large maintenance burden for a one-person or small operation. Aggregators like
[Blotato](https://blotato.com) expose one API for many platforms (list connected accounts,
upload media, create/schedule post, poll status). This is a genuine third-party dependency
with its own subscription — treat it like Headroom/other optional third-party tools in
DEVBUREAU.md: never assume it exists, confirm the client/user actually has an account
before writing code that calls it, and prefer the native Instagram path (Path 1) when the
scope is Instagram-only.

If adopted, the workflow is: list accounts → upload media (get media IDs) → create post
referencing those IDs → poll status until `published` or `failed`. Use ISO 8601 for any
scheduled datetime.

## Rules

- **Caption limits:** Instagram 2200 chars. Trim the copy (already run through
  `humanizer`) to fit before attempting to publish, not after a rejection.
- **Image format:** JPEG, 2-10 per Instagram carousel.
- **Never publish without the exact final assets shown to the user in the checkpoint** —
  a last-minute swap of an unapproved image is a Trilha de Auditoria violation even if the
  end result "looks fine".
