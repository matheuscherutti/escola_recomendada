---
name: lean-audit
description: "Use when the user says \"review for over-engineering\", \"what can we delete\", \"is this over-engineered\", \"audit this codebase for bloat\", or invokes /lean-audit — finds over-engineering to delete (reinvented standard library, unneeded dependencies, speculative abstractions, dead flexibility), one line per finding, ranked by impact. Out of scope: correctness bugs, security holes, performance — route those to a normal review."
allowed-tools: Read, Grep, Glob, Bash
---

# Lean Audit

> Find what to cut. The best outcome for this audit is a diff that gets shorter.

Complements `lean-code-ladder` (which governs what gets written) by catching what already got written and shouldn't have. Reports only — never applies a fix itself.

---

## ⚠️ Core Principle

- Scope is strictly over-engineering and complexity. Correctness bugs, security holes, and performance are explicitly out of scope — name them if you notice them, but route them to a normal review pass, not this report.
- One line per finding. No paragraph defending why something should be deleted — the tag and the replacement say enough.
- A single smoke test, an `assert`-based self-check, or a `lean:` marker (see `lean-code-ladder`) is never a finding — those are the system working as intended, not bloat.

---

## 1. Scope

| Scope | Trigger | What's scanned |
|---|---|---|
| **Diff** (default) | "review this", "review for over-engineering", `/lean-audit` with no argument | `git diff` (staged + unstaged) against the base branch |
| **Repo** | "audit the whole repo", "find bloat", `/lean-audit repo` | The whole tracked tree, excluding `node_modules`, build output, vendored/generated files |

Repo-scope audits rank findings biggest-cut-first; diff-scope audits list them in diff order. "Biggest cut first" is this skill's leverage proxy — cuts here are uniformly low-effort by construction (delete, rename, one-line swap), so size of the cut already tracks impact ÷ effort without a separate formula.

---

## 2. Tags

| Tag | Meaning | Replacement |
|---|---|---|
| `delete:` | Dead code, unused flexibility, speculative feature | Nothing |
| `stdlib:` | Hand-rolled thing the standard library already ships | Name the stdlib function |
| `native:` | Dependency or code doing what the platform already does | Name the native feature |
| `yagni:` | Abstraction with one implementation, config nobody sets, layer with one caller | Inline it |
| `shrink:` | Same logic, fewer lines | Show the shorter form |

---

## 3. Format

`<file>:L<line>: <tag> <what>. <replacement>.`

Examples:

```
src/validators.py:L12-38: stdlib: 27-line email validator class. "@" in email is enough; real validation is the confirmation mail.
src/widgets.js:L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.
repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.
cache.py:L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.
utils.py:L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.
```

---

## 4. What to Hunt

Dependencies the stdlib or platform already ships, single-implementation interfaces, factories with one product, wrapper functions that only delegate, files exporting one thing nobody else needs separated out, dead flags/config, hand-rolled reimplementations of stdlib functions.

---

## 5. Scoring

End every report with the only metric that matters:

- Diff scope: `net: -<N> lines possible.`
- Repo scope: `net: -<N> lines, -<M> dependencies possible.`

Nothing to cut: `Lean already. Ship.` — and stop there, don't manufacture a finding to avoid an empty report.

---

## 6. Boundaries

- Lists findings, applies none. The user (or a follow-up task) decides what to actually delete.
- Out of scope: correctness, security, performance. A normal code review or `security-auditor` pass covers those.
- Does not flag anything `lean-code-ladder`'s "When NOT to Be Lazy" section protects (validation, error handling, security, accessibility, explicit requests) — those are correct as written, not bloat.
