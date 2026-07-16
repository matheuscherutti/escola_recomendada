---
description: Harvests every `lean:` shortcut marker in the codebase into a one-shot debt ledger, so deferred simplifications don't quietly become permanent.
---

# /lean-debt - Lean Shortcut Ledger

$ARGUMENTS

---

## Purpose

`lean-code-ladder` asks agents to mark every deliberate shortcut with a `lean:` comment naming its ceiling and upgrade trigger. This command collects all of them into one ledger so "later" gets tracked instead of forgotten. Apply the `lean-debt` skill for the exact scan command and report format.

This command never resolves a shortcut — it only reports where they are.

---

## Behavior

1. Grep the repo for the `lean:` comment marker (matching the comment prefix, not just the bare word), skipping `node_modules`, `.git`, and build output.
2. One row per marker, grouped by file: `<file>:<line>, <what was simplified>. ceiling: <limit>. upgrade: <trigger>.`
3. Flag any marker with no named ceiling/trigger as `no-trigger` — those are the ones most likely to rot silently.
4. End with `<N> markers, <M> with no trigger.` Nothing found: `No lean: debt. Clean ledger.`
5. Report only by default. If asked to persist it, write to `LEAN-DEBT.md` at the project root — don't write a file unasked.

---

## Examples

```
/lean-debt
/lean-debt and save it to a file
```
