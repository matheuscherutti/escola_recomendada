---
name: systematic-debugging
description: Use when debugging complex issues, before proposing any fix — 4-phase systematic debugging methodology with root cause analysis and evidence-based verification.
allowed-tools: Read, Glob, Grep, Bash
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

**Use this ESPECIALLY when:** under time pressure, "just one quick fix" seems obvious, you've already tried multiple fixes, or the previous fix didn't work. Simple-looking bugs have root causes too — systematic is faster than thrashing, not slower.

## Phase 1: Reproduce

Before fixing, reliably reproduce the issue.

```markdown
## Reproduction Steps
1. [Exact step to reproduce]
2. [Next step]
3. [Expected vs actual result]

## Reproduction Rate
- [ ] Always (100%)  - [ ] Often (50-90%)  - [ ] Sometimes (10-50%)  - [ ] Rare (<10%)
```

If not reproducible → gather more data, don't guess.

## Phase 2: Isolate

- When did this start happening? What changed recently (`git log`, `git diff`)?
- Does it happen in all environments? Can you reproduce with minimal code?
- **In multi-component systems** (CI → build → signing, API → service → database): before proposing fixes, add diagnostic instrumentation at each component boundary — log what enters and exits each layer — run once to see WHERE it breaks, then investigate that specific component. Don't guess which layer is at fault.
- **Bug deep in the call stack?** Trace backward through the call chain to the original trigger before fixing — see [root-cause-tracing.md](root-cause-tracing.md). Fix at the source, not at the symptom.

## Phase 3: Understand (Root Cause)

```markdown
## Root Cause Analysis — The 5 Whys
1. Why: [First observation]
2. Why: [Deeper reason]
3. Why: [Still deeper]
4. Why: [Getting closer]
5. Why: [Root cause]
```

Find working examples similar to what's broken. Read any reference implementation completely, not skimmed. List every difference between working and broken, however small — don't assume "that can't matter."

## Phase 4: Fix & Verify

1. **Create a failing test case first** — simplest reproduction, automated if possible, must exist before the fix.
2. **Implement ONE fix** addressing the root cause. No "while I'm here" improvements, no bundled refactoring.
3. **Verify**: bug no longer reproduces, no other tests broken, no new issues introduced, regression test added. Apply `verification-before-completion`'s evidence bar — don't claim "fixed" without re-running the original failing case and watching it pass now.

### Phase 4.5: If 3+ Fixes Failed, Question the Architecture

```
1 or 2 failed fixes → return to Phase 1, re-analyze with new information.
3+ failed fixes, each revealing a new problem in a different place → STOP.
```

This is not "try Fix #4." Three-plus fixes that each require touching more code, or each surface a new symptom elsewhere, is a signal the pattern itself is wrong — not that you haven't found the right patch yet. Discuss with the user before attempting more fixes: is this architecture sound, or are we sticking with it through inertia? Should we refactor instead of continuing to patch?

## Defense in Depth (after the fix)

Once you've found and fixed the root cause, consider whether validation at multiple layers would have caught this sooner or would catch a similar future bug — see [defense-in-depth.md](defense-in-depth.md). This is a post-fix hardening step, not a substitute for finding the root cause first.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Issue is simple, don't need process" | Simple issues have root causes too. The process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | The first fix sets the pattern. Do it right from the start. |
| "I'll write the test after confirming the fix works" | Untested fixes don't stick. Test-first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern, don't fix again. |

## Red Flags — STOP and Return to Phase 1

- "Quick fix for now, investigate later" / "Just try changing X and see"
- "Skip the test, I'll manually verify"
- Proposing a fix before tracing data flow
- Each fix reveals a new problem in a different place

**Watch for these signals from the user, too** — they often mean you skipped a step:
- "Is that not happening?" — you assumed without verifying
- "Stop guessing" — you're proposing fixes without understanding
- "We're stuck?" (frustrated) — your current approach isn't working

## Common Debugging Commands

```bash
git log --oneline -20 && git diff HEAD~5    # recent changes
grep -r "errorPattern" --include="*.ts"      # search for pattern
pm2 logs app-name --err --lines 100          # check logs
```

## Quick Reference

| Phase | Key Activities | Success Criteria |
|---|---|---|
| 1. Reproduce | Get exact steps, reproduction rate | Can trigger it reliably (or know why not) |
| 2. Isolate | Recent changes, working examples, instrumentation | Know WHERE it breaks |
| 3. Understand | 5 Whys, trace data flow | Know WHY it breaks |
| 4. Fix & Verify | Failing test → fix → verify | Bug resolved, evidence in hand |
| 4.5 (if 3+ failed) | Question the architecture | Decide: keep patching or refactor |

## Supporting Techniques

- **[root-cause-tracing.md](root-cause-tracing.md)** — trace a bug backward through the call stack to its original trigger
- **[defense-in-depth.md](defense-in-depth.md)** — add validation at multiple layers once the root cause is fixed
- **[condition-based-waiting.md](condition-based-waiting.md)** — replace arbitrary timeouts with condition polling for timing/race-condition bugs

**Related skills:** `verification-before-completion` for the evidence bar on "fixed"; `confidence-scale` for marking how certain the root cause claim actually is (🟢 reproduced + traced to `file:line`, 🟡 most likely but unreproduced, 🔴 can't determine from available evidence).
