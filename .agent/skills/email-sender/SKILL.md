---
name: email-sender
description: "Use when a squad needs to send an email — a client handoff notification, a lead-gen sequence, a newsletter, a transactional receipt. Triggers: 'send this as an email', 'manda esse email', 'dispara a newsletter', 'envia notificação por email'. Calls Resend's HTTP API via a deterministic script (single or batch send, HTML or plain text, attachments, scheduling). Requires a verified sending domain — unverified senders are rejected by the provider, not by this skill."
allowed-tools: Read, Write, Bash
---

# Email Sender

Sends transactional or marketing email via [Resend](https://resend.com)'s HTTP API,
called through a deterministic script. Adapted from
[renatoasse/opensquad](https://github.com/renatoasse/opensquad) (MIT).

## Setup (one-time, per client/project)

1. Create a Resend account, generate an API key (starts with `re_`).
2. Add and verify a sending domain (or use Resend's shared `onboarding@resend.dev` for
   testing only — not for real client sends).
3. Set `RESEND_API_KEY` in `.env`.

## Usage

Single email:
```bash
python .agent/skills/email-sender/scripts/send_email.py \
  --from "team@clientdomain.com" --to "person@example.com" \
  --subject "Subject under 80 chars for deliverability" \
  --html "path/to/body.html"
```

Batch (JSON array of `{"from","to","subject","html" or "text"}` objects):
```bash
python .agent/skills/email-sender/scripts/send_email.py --batch emails.json
```

Scheduling: add `--scheduled-at "2026-08-01T09:00:00Z"` (ISO 8601) to queue for future
delivery instead of sending immediately.

## Rules

- **Verify the sending domain first** — Resend rejects unverified senders outright; this
  is a provider-side hard stop, not a soft warning.
- **Subject line under 80 chars** for better deliverability.
- **HTML emails: keep markup simple** — most email clients strip complex CSS; use
  inline styles and basic layout, not the same template conventions as
  `carousel-design-system` (that's for images, this is for an email client's limited
  renderer).
- **Never send without surfacing delivery errors** — check the response for an `id`; a
  missing `id` means the send failed even if the script exits 0 on the HTTP call itself.
- **Batch sends still need per-client copy** — do not blast one generic email to a list
  gathered for a different purpose; treat each recipient's content need per the squad's
  actual brief.
