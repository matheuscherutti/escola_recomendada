---
description: Extracts generalizable engineering patterns from a reference project you point at (local path or git URL) and logs Adopt/Consider/Skip recommendations for DevBureau's own knowledge base. Never edits DevBureau's skills/agents/memory directly — produces a report for your review.
---

# /mine-patterns - Senior Project Pattern Mining

$ARGUMENTS

---

## Purpose

Some of the best engineering knowledge isn't in another AI-agent kit — it's in a finished, professional-grade codebase someone already built well. This command points DevBureau's own learning loop at a project you choose, extracts the generalizable engineering patterns (not the business logic), and proposes where each one would land in DevBureau's `lessons.md` or a specific skill/agent. Apply the `pattern-mining` skill for the full methodology.

Distinct from `/benchmark`, which compares DevBureau against other AI-agent kits of the same architecture class — this command studies regular software projects, built by people, for engineering wisdom DevBureau can absorb.

---

## Behavior

When `/mine-patterns <path-or-url>` is triggered:

1. **Resolve the target** — local path read in place, or a git URL shallow-cloned into a scratch directory (never into the DevBureau repo). Ask for a corrected input if neither resolves.
2. **Recon** — README, manifest, folder structure, CI config, test setup; note maturity signals (commit history, CI status, test coverage) instead of taking "professional-grade" on faith.
3. **Extract patterns** — architecture/module boundaries, error handling, testing strategy, configuration/secrets handling, dependency/tooling choices, naming/organization, CI/CD setup. Business/domain rules are explicitly out of scope — they don't generalize.
4. **Mark confidence** — every pattern gets a `confidence-scale` 🟢/🟡/🔴 mark and a `file:line`/directory reference.
5. **Map to a destination** — each pattern proposes exactly one landing spot: a new `lessons.md` entry (Gatilho/Confiança/Evidência format) or a named skill/agent file update.
6. **Log, don't apply** — append a dated entry to `.agent/memory/pattern-mining-log.md` with every pattern scored Adopt/Consider/Skip. Present the Adopt list and ask if the user wants any turned into a real edit — do not start editing `.agent/` in this same pass.

---

## Output Format

```markdown
## 🔍 Pattern Mining Run — [repo] — [date]

### Recon
- Stack: ...
- Maturity signals: ...

### Patterns Found

| Pattern | Confidence | Where observed | Destination | Verdict |
|---|---|---|---|---|
| [pattern] | 🟢/🟡/🔴 | `file:line` | lessons.md / skill/agent | Adopt/Consider/Skip |

### Adopt — Ready for a Follow-up Task
1. [item]

### Consider — Needs a Decision
1. [item, with the trade-off in one line]
```

---

## Examples

```
/mine-patterns ../my-other-project
/mine-patterns https://github.com/some-org/well-built-service
/mine-patterns C:\Projects\client-app focus on error handling and testing
```

---

## Key Principles

- **Patterns, not business logic** — what generalizes to other projects, not what's specific to this one's domain.
- **Never copy, always paraphrase** — describe the idea in DevBureau's own words; attribute, don't lift verbatim.
- **Recommend, don't implement** — this command's output is a report; merging a finding into a real skill/agent/lessons.md is a separate, explicitly-approved task.
- **Mind the license** — flag IP/licensing sensitivity instead of silently mining a proprietary repo that isn't the user's own.
