---
description: Periodically compares DevBureau's agents/skills/workflows against well-regarded external agent-framework collections, scores the gaps, and logs recommendations. Never auto-applies changes.
---

# /benchmark - Continuous Framework Benchmarking

$ARGUMENTS

---

## Purpose

DevBureau should stay current by comparing itself against actively-maintained agent/skill collections for Claude Code, Cursor, Codex, and Antigravity — and by deliberately rejecting ideas that don't fit its tiered, non-programmer-friendly philosophy. This command runs that comparison and produces a recommendation report. It does not implement anything by itself.

Apply the `framework-benchmarking` skill for the full rubric and source list.

---

## Behavior

When `/benchmark` is triggered:

1. **Read the last run**
   - Open `.agent/memory/benchmark-log.md` — find the date and findings of the previous run
   - Open `.agent/skills/framework-benchmarking/references/sources.md` — the known source list

2. **Get DevBureau's real current state**
   - Run `python .agent/scripts/doctor.py` — current agent/skill/workflow counts
   - Don't rely on counts written in README/ARCHITECTURE.md — they can drift; `doctor.py` is the ground truth

3. **Refresh each source** (`WebSearch`/`WebFetch`)
   - Is it still maintained? (recent commits, no abandonment signals)
   - What changed since the last logged run?
   - Any new credible source surfaced that should be added to the watch list?

4. **Compare structurally**
   - Agent categories, skill categories, multi-IDE support, hooks, MCP configs, rules-file format per IDE (see the skill's Step 2 table)

5. **Score every finding**
   - **Adopt** / **Consider** / **Skip**, one-line reason each
   - Flag explicitly when something is being skipped *because* it conflicts with `stack-sizing`'s lean-tier philosophy, not just because it's extra work

6. **Log, don't implement**
   - Append a new dated entry to `.agent/memory/benchmark-log.md` with the full findings
   - Update `references/sources.md` if a new source was found or an existing one's stats changed materially
   - Present the **Adopt** items to the user as a short punch list and ask if they want them turned into a real implementation task — do not start editing code in this same pass

---

## Output Format

```markdown
## 🔭 Benchmark Run — [date]

### Sources Checked
- [source]: [what changed since last run, or "no material change"]

### Findings

| Finding | Verdict | Reason |
|---|---|---|
| [finding] | Adopt/Consider/Skip | [one line] |

### Adopt — Ready for a Follow-up Task
1. [item]

### Consider — Needs a Decision
1. [item, with the trade-off in one line]
```

---

## Examples

```
/benchmark
/benchmark focus on hooks and MCP coverage
/benchmark check if the planning-methodology source added anything new since last run
```

---

## Key Principles

- **Diff, don't restart** — always check the log before re-researching from scratch
- **Score everything** — no finding sits in limbo without a verdict
- **Recommend, don't implement** — this command's output is a report; turning an "Adopt" item into code is a separate, explicitly-approved task
- **Bigger isn't better** — a "Skip" because it doesn't fit DevBureau's lean, tiered philosophy is a valid, even desirable, outcome
