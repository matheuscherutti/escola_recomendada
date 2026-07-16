---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions — especially if feedback seems unclear or technically questionable. Requires verification and reasoned response, not performative agreement or blind implementation.
allowed-tools: Read, Grep, Glob, Bash
---

# Receiving Code Review

## Overview

Code review requires technical evaluation, not emotional performance. Pairs with `code-review-checklist` (the giving side) — this skill governs how to respond once feedback arrives, whether from the project owner or an external/automated reviewer.

**Core principle:** Verify before implementing. Ask before assuming. Technical correctness over social comfort.

This directly extends DEVBUREAU.md's Anti-Bajulação (anti-sycophancy) principle — the same discipline of not capitulating to flawed input applies whether the speaker is the end user or a code reviewer mid-implementation.

## The Response Pattern

```
1. READ the complete feedback without reacting
2. UNDERSTAND — restate the requirement in your own words, or ask
3. VERIFY — check the claim against the actual codebase
4. EVALUATE — technically sound for THIS codebase, not in the abstract?
5. RESPOND — technical acknowledgment or reasoned pushback
6. IMPLEMENT — one item at a time, test each
```

## Forbidden Responses

**Never:** "You're absolutely right!", "Great point!", "Excellent feedback!", or "Let me implement that now" before verification. These are performative — they signal agreement before the claim has been checked.

**Instead:** restate the technical requirement, ask a clarifying question, push back with technical reasoning if the suggestion is wrong, or just start working — actions over words. When feedback IS correct: `"Fixed. <what changed>"` or `"Good catch — <specific issue>. Fixed in <location>."` No gratitude phrasing ("Thanks for catching that!") — the fix itself shows the feedback landed.

## Handling Unclear Feedback

If any item in multi-point feedback is unclear, stop — do not implement any of it yet, including the parts you do understand. Items may be related; partial understanding produces a wrong implementation of the parts you thought were clear too.

```
❌ Implement the clear items now, ask about the unclear ones later
✅ "I understand items 1, 2, 3, 6. Need clarification on 4 and 5 before proceeding."
```

## Source-Specific Handling

**From the project owner/user:** trusted — implement after understanding, but still ask if scope is unclear. No performative agreement; skip straight to action or a brief technical acknowledgment.

**From an external or automated reviewer:** before implementing, check whether the suggestion is technically correct for *this* codebase (not just correct in general), whether it breaks existing functionality, whether there's a reason the current implementation looks the way it does, and whether the reviewer had full context. If it seems wrong, push back with technical reasoning. If you can't verify it, say so explicitly: "I can't verify this without X. Should I investigate, ask, or proceed?" If a suggestion conflicts with a decision the project owner already made, stop and surface that conflict rather than silently picking a side.

## YAGNI Check for "Do It Properly" Suggestions

When a reviewer suggests fully implementing something ("add proper metrics tracking with filters and export"), grep the codebase for actual usage first:

```
IF unused: "This isn't called anywhere. Remove it instead (YAGNI)?"
IF used: implement properly as suggested.
```

A reviewer suggesting more code is not evidence that more code is the right call — verify the feature is load-bearing before building it out.

## Implementation Order

For multi-item feedback: clarify everything unclear first, then implement blocking issues (breaks, security) before simple fixes (typos, imports) before complex fixes (refactoring, logic). Test each fix individually and verify no regressions before moving to the next item — don't batch fixes and test once at the end.

## When to Push Back

Push back when the suggestion breaks existing functionality, the reviewer lacks full context, it violates YAGNI, it's technically incorrect for this stack, there's a legacy/compatibility reason, or it conflicts with an architectural decision the project owner already made. Use technical reasoning, ask specific questions, reference working tests or code — not defensiveness.

If you pushed back and turn out to be wrong: state the correction factually and move on — `"Verified this and you're correct — my initial understanding was wrong because X. Fixing."` No long apology, no over-explaining the original pushback.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Performative agreement | State the requirement or just act |
| Blind implementation | Verify against the codebase first |
| Batch fixes without testing each | One at a time, test each |
| Assuming the reviewer is right | Check whether it actually breaks something |
| Avoiding pushback for comfort | Technical correctness over social comfort |
| Implementing the clear items, deferring the unclear ones | Clarify all items first, then implement |
| Can't verify, proceeds anyway | State the limitation, ask for direction |

## GitHub Thread Replies

When replying to inline review comments on a PR, reply in the comment thread (`gh api repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`), not as a new top-level PR comment.

## The Bottom Line

External feedback is suggestions to evaluate, not orders to follow. Verify. Question if warranted. Then implement.
