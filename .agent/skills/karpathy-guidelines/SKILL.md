---
name: karpathy-guidelines
description: "Use when writing, reviewing, or refactoring code to apply Karpathy's four LLM coding disciplines: surface assumptions before implementing, keep code minimal, make only surgical targeted changes, and define verifiable success criteria. Derived from Andrej Karpathy's observations on recurring LLM coding pitfalls."
---

# Karpathy Guidelines

> Derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls: "They make wrong assumptions without checking. They overcomplicate code. They change adjacent code as side effects. They don't define what 'done' looks like."

**Tradeoff:** These guidelines bias toward caution over speed. For trivial one-liner tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing anything:
- State assumptions explicitly — if uncertain about scope, ask rather than guess
- When multiple interpretations exist, present them; don't pick silently
- Push back if a simpler approach exists — say so before implementing the complex one
- If something is unclear, stop, name what's confusing, and ask

**DevBureau cross-reference:** The Socratic Gate (DEVBUREAU.md TIER 0) already mandates this for complex requests. Apply this same discipline on *simple* requests too — the gate only fires on complexity triggers, but ambiguity exists at all sizes.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was explicitly asked
- No abstractions for single-use code
- No "flexibility" or "configurability" that wasn't requested
- No error handling for scenarios that can't happen
- If 200 lines could be 50 with no loss of correctness, rewrite it

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify before submitting.

**DevBureau cross-reference:** The `lean-code-ladder` skill extends this with a 7-rung decision procedure (YAGNI → reuse → stdlib → native → existing dep → one-liner → minimum). Start there; use this principle as the "overcomplicated?" gut check after applying the ladder.

---

## 3. Surgical Changes (Net-New in DevBureau)

**Touch only what the request explicitly requires. Never improve adjacent code.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match the existing style, even if you'd do it differently
- If you notice unrelated issues (dead code, typos, smells), **mention** them — never fix them silently

When your changes create orphans:
- Remove imports/variables/functions that **YOUR** changes made unused
- Don't remove pre-existing dead code unless explicitly asked

**The line test:** Every changed line must trace directly to the user's request. If it can't, undo it.

**Scope creep signals to catch yourself on:** "while I'm in here I also…", "I noticed this and improved…", "I cleaned up adjacent…", "I refactored while fixing…"

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform imperative tasks into verifiable goals:

| Instead of... | Transform to... |
|---|---|
| "Add validation" | "Write tests for invalid inputs, then make them pass" |
| "Fix the bug" | "Write a test that reproduces it, then make it pass" |
| "Refactor X" | "Ensure tests pass before and after" |

For multi-step tasks, state a brief plan with explicit verification per step:
```
1. [Step] → verify: [specific check]
2. [Step] → verify: [specific check]
3. [Step] → verify: [specific check]
```

Strong success criteria let the loop run independently. Weak criteria ("make it work", "looks good") require constant clarification and produce unchecked assumptions.

**DevBureau cross-reference:** Zero-Break Protocol's evidence table in DEVBUREAU.md TIER 0 enforces the same idea from the other direction ("no completion claim without fresh evidence"). Use both: define success criteria *before* (Goal-Driven) and require fresh evidence *after* (Zero-Break).

---

## How to Know These Guidelines Are Working

- **Fewer unnecessary lines in diffs** — only requested changes appear
- **Fewer rewrites due to overcomplication** — code is minimal the first time
- **Clarifying questions come before implementation** — not after mistakes
- **Clean, minimal PRs** — no drive-by refactoring, no "improvements"
