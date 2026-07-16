---
name: lean-code-ladder
description: "Use before writing any new code, and whenever the user says \"keep it simple\", \"don't over-engineer\", \"yagni\", \"minimal solution\", \"lazy mode\", or complains about bloat/boilerplate/unnecessary dependencies — decision procedure for the smallest correct solution (climb a 7-rung ladder: exist? reuse? stdlib? native? existing dependency? one line? only-then-minimum). Never cuts validation, error handling, security, or accessibility."
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Lean Code Ladder

> **Lazy means efficient, not careless.** The best code is the code never written — but the ladder runs after you understand the problem, never instead of it.

Less code is fewer tokens to generate, fewer tokens to re-read in every future turn that touches this file, and fewer places a bug can hide. This skill is DevBureau's decision procedure for getting there without losing quality — it does not relax `clean-code`'s standards, it decides *how much code* should exist before those standards apply to it.

---

## ⚠️ Core Principle

- Read and understand the problem fully first. Trace the real flow, every file the change touches. A small diff you don't understand is laziness dressed up as efficiency — it ships a confident wrong fix.
- Once you understand it, stop at the **first rung that holds**. Don't research the "best" solution past the rung that already works.
- Never simplify away: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics, anything the user explicitly asked for.

---

## 1. The Ladder

Stop at the first rung that holds:

| # | Rung | Question |
|---|---|---|
| 1 | **YAGNI** | Does this need to exist at all? Speculative need → skip it, say so in one line. |
| 2 | **Reuse** | Already in this codebase? A helper, util, type, or pattern that lives here → reuse it. Re-implementing something a few files over is the most common source of bloat. |
| 3 | **Stdlib** | Does the standard library already do this? Use it. |
| 4 | **Native** | Does a native platform feature cover it? `<input type="date">` over a picker library, CSS over JS, a DB constraint over application code. |
| 5 | **Existing dependency** | Does an already-installed dependency solve it? Use it — never add a new dependency for what a few lines of an existing one can do. |
| 6 | **One line** | Can this be one line? Make it one line. |
| 7 | **Minimum** | Only then: the minimum code that actually works. |

Two rungs both work? Take the higher one (closer to rung 1) and move on — don't keep climbing down to compare options once something already holds.

**Bug fix = root cause, not symptom.** A report names a symptom. Before editing, grep every caller of the function you're about to touch. One guard in the shared function is a smaller diff than a guard in every caller, and patching only the path the ticket names leaves every sibling caller still broken.

---

## 2. Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- No boilerplate or scaffolding "for later" — later can scaffold for itself when it actually arrives.
- Deletion over addition. Boring over clever — clever is what someone has to decode at 3am, possibly you.
- Fewest files possible. Shortest working diff wins, but only once you understand the problem.
- Complex request? Ship the lean version and name the tradeoff in the same response: "Did X; Y covers it. Need the full version? Say so." Don't stall on a question you can default.
- Two stdlib/native options of similar size? Take the one correct on edge cases — lean means less code, not the flimsier algorithm.

---

## 3. Marking Deliberate Shortcuts

Mark every intentional simplification with a `lean:` comment naming its ceiling and upgrade trigger, so "later" doesn't quietly become "never":

```python
# lean: global lock, switch to per-account locks if throughput becomes the bottleneck
```

```javascript
// lean: in-memory cache, move to Redis once this runs across more than one instance
```

A comment with no named ceiling or trigger is worse than no comment — `/lean-debt` flags those as `no-trigger` risks. Run `/lean-debt` periodically to harvest every marker into a ledger before a deferred shortcut rots into a permanent, undocumented one.

---

## 4. Calibrate by Project Tier

The ladder's aggressiveness scales with `stack-sizing`'s declared tier — a Prototype and an Enterprise/Critical system should not climb the same way:

| Tier | How hard to climb |
|---|---|
| Prototype/Landing | Climb aggressively. Rung 6-7 (one-liner/minimum) is usually the right stopping point — there's no team or audit trail to protect yet. |
| MVP | Climb normally as described above. |
| Growth SaaS | Climb, but weigh rung 7 against the next reader: a "minimum that works" without a `lean:` marker is now technical debt several people inherit, not just future-you. |
| Enterprise/Critical | Climb, but rung 7 needs the marker *and* a named owner/trigger more rigorously — auditability and the paper trail matter as much as the line count here. Don't golf code that compliance/audit will need to read carefully. |

See `stack-sizing`'s Output Contract for where the tier is recorded.

---

## 5. Output Discipline

Code first. Then at most a few short lines: what was skipped, when to revisit it. No essays, no feature tours defending the simplification — if the explanation is longer than the code, delete the explanation; a paragraph defending a simplification is complexity smuggled back in as prose.

Pattern: `[code] → skipped: [X], add when [Y].`

Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not the kind of prose this rule targets — give that in full. The rule is only against *unrequested* prose.

---

## 6. When NOT to Be Lazy

Never simplify away:
- Input validation at trust boundaries.
- Error handling that prevents data loss.
- Security measures (auth, secrets handling, injection prevention).
- Accessibility basics.
- Anything the user explicitly asked for, in full, even if a shorter version would also technically work.
- Understanding the problem itself — the ladder shortens the *solution*, never the *reading*.

Non-trivial logic (a branch, a loop, a parser, a money/security path) leaves one runnable check behind — the smallest thing that fails if the logic breaks (an assertion-based self-check, or one small test). Trivial one-liners need no test; this rule is not an excuse to skip tests on real logic.

---

## 7. Anti-Patterns

- Climbing the ladder before reading the code the change touches — that's guessing, not laziness.
- Treating "fewest tokens" as the goal. The goal is "write only what the task needs" — fewer tokens is the side effect on models that follow the ladder, not the target itself.
- A `lean:` marker with no ceiling or trigger named — that's an unmarked shortcut wearing a marker's clothes.
- Re-litigating "but what if scale demands more" on every single line — that's what the marker + `/lean-debt` ledger exists for; mark it and move on.
