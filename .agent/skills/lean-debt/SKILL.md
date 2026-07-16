---
name: lean-debt
description: Use when the user says "lean debt", "/lean-debt", "what shortcuts did we defer", "list the lean markers", or "what did we mark to revisit" — harvests every `lean:` comment in the codebase into a debt ledger, one-shot report, changes nothing.
allowed-tools: Read, Grep, Glob, Write
---

# Lean Debt

Every deliberate shortcut from `lean-code-ladder` is marked with a `lean:` comment naming its ceiling and upgrade trigger. This skill collects them into one ledger so a deferral can't quietly become permanent.

---

## 1. Scan

Grep the repo for the comment marker, skipping `node_modules`, `.git`, and build output:

```bash
grep -rnE '(#|//|<!--) ?lean:' . --include=\*.py --include=\*.js --include=\*.ts --include=\*.jsx --include=\*.tsx --include=\*.go --include=\*.rs --include=\*.html
```

Add other comment prefixes if the project's stack uses a style not listed above (e.g. `--` for SQL, `;` for Lisp-family).

Each hit is one ledger row. Matching the comment prefix (not just the bare word "lean") keeps prose that merely mentions the convention out of the ledger.

---

## 2. Output

One row per marker, grouped by file:

```
<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.
```

Pull the ceiling and the trigger straight from the comment (the convention is `lean: <ceiling>, <upgrade path>`). Want an owner per row too? Add `git blame -L<line>,<line> <file>`.

Flag the rot risk: any `lean:` comment that names no ceiling or upgrade trigger gets a `no-trigger` tag — those are the ones most likely to silently rot since there's nothing pointing at when to revisit them.

End with: `<N> markers, <M> with no trigger.` Nothing found: `No lean: debt. Clean ledger.`

---

## 3. Persisting the Ledger

Reads and reports only by default, changes nothing. If the user asks to persist it, write the ledger to a file (e.g. `LEAN-DEBT.md` at the project root) — don't write it unasked, a one-shot chat report is the default.

---

## 4. Boundaries

- One-shot. Re-run `/lean-debt` whenever a status check is wanted; this skill does not track state between runs on its own.
- Does not resolve any debt item, only reports it — resolving a marked shortcut is a normal coding task, picked up separately once flagged.
