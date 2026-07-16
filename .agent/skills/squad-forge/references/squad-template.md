# Squad Definition Template

Copy into `squads/<squad-name>/squad.md` and fill every section. Keep under ~150 lines.
Sections marked OPTIONAL may be deleted; everything else is mandatory.

```markdown
---
name: <squad-name>
goal: <one sentence — the business outcome this squad delivers>
checkpoint-mode: key-points | every-step | autonomous
version: "1.0.0"
---

# <Readable Squad Name>

## When to run
<The concrete situation that justifies a run — e.g. "a new client asked for X".>

## Inputs (asked at the start of every run)
- <input 1 — e.g. client name, briefing document, reference URLs>
- <input 2>

## Pipeline

| # | Step | Agent (kit) | Skills to load | Deliverable | Checkpoint after? |
|---|------|-------------|----------------|-------------|-------------------|
| 1 | <label> | <agent-name> | <skill, skill> | output/01-<name>.md | No |
| 2 | <label> | <agent-name> | <skill> | output/02-<name>.md | **Yes — <what the user approves>** |

## Checkpoints (business language)
1. **After step <n> — <label>:** what is being approved, what it costs to proceed, what
   can go wrong. Irreversible actions (deploy, publish, spend, delete) are ALWAYS
   checkpoints, whatever the checkpoint-mode says.

## Done means
<The verifiable final state — deliverables that must exist, checks that must pass.>

## Out of scope (OPTIONAL)
<What this squad deliberately does not do, and where that work goes instead.>
```
