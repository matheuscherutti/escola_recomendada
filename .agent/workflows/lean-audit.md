---
description: Finds over-engineering to delete in the current diff (default) or the whole repo. Reports only, applies nothing.
---

# /lean-audit - Over-Engineering Finder

$ARGUMENTS

---

## Purpose

Run a complexity-only audit: reinvented standard library, unneeded dependencies, speculative abstractions, dead flexibility. Apply the `lean-audit` skill for the full tag taxonomy and format.

This command never edits code. It produces a ranked list of what to cut; turning a finding into an actual deletion is a separate, explicitly-approved follow-up.

---

## Behavior

1. **Determine scope**
   - No argument, or "diff"/"this" → scan `git diff` (staged + unstaged) against the base branch
   - "repo"/"audit"/"whole codebase" → scan the whole tracked tree (skip `node_modules`, build output, vendored/generated files)

2. **Hunt** for: dependencies the stdlib/platform already ships, single-implementation interfaces, factories with one product, delegate-only wrappers, dead flags/config, hand-rolled stdlib reimplementations.

3. **Tag and report**, one line per finding: `<file>:L<line>: <tag> <what>. <replacement>.`
   - Tags: `delete:` `stdlib:` `native:` `yagni:` `shrink:`
   - Diff scope: list in diff order. Repo scope: rank biggest cut first.

4. **Score**
   - Diff: `net: -<N> lines possible.`
   - Repo: `net: -<N> lines, -<M> dependencies possible.`
   - Nothing to cut: `Lean already. Ship.`

5. **Stay in scope** — correctness bugs, security holes, and performance are out of scope for this command. Mention them in passing if spotted, but don't turn this into a full code review.

---

## Examples

```
/lean-audit
/lean-audit repo
/lean-audit focus on the API layer
```
