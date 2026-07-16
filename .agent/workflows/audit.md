---
description: Surveys the codebase as a senior advisor across nine categories (bugs, security, performance, tests, tech debt, dependencies, DX, docs, direction), vets every finding, ranks by leverage, and writes self-contained handoff plans for a different agent or session. Never edits code.
---

# /audit - Codebase Audit & Handoff Plans

$ARGUMENTS

---

## Purpose

Find the highest-leverage improvements in this codebase and write implementation plans good enough for an agent with zero context from this session to execute. Apply the `codebase-audit` skill for the full workflow.

Distinct from `/plan` (short, same-session plan for the agent that just wrote it) and `/ade` (plans and executes itself after approval). This command only surveys and plans — it never writes to source code, only to `plans/`.

---

## Behavior

1. **Recon** — read README/CLAUDE.md/AGENTS.md, config, CI, conventions, exact build/test/lint commands, git churn. Also ingest ADRs/PRDs/`CONTEXT.md`/`DESIGN.md`/`PRODUCT.md` where present — documented tradeoffs aren't re-flagged as findings; a stale ADR (code drifted from the decision) is itself a finding.
2. **Audit** — nine categories, reusing existing DevBureau skills per category (`vulnerability-scanner`, `performance-profiling`, `testing-patterns`, `lean-audit`, `migration-strategy`, `documentation-templates`, `product-manager`'s RICE for direction). Fan out to parallel `Explore` agents if the host supports it.
3. **Vet** — re-read every cited `file:line` yourself before it reaches the table. Reject by-design behavior, settled tradeoffs, mis-attributions, and duplicates.
4. **Prioritize** — rank by leverage (impact ÷ effort, discounted by confidence/risk). Present the table, then direction findings separately.
5. **Wait for selection** — ask which findings become plans. Don't plan everything unasked.
6. **Write plans** — one file per selection in `plans/NNN-<slug>.md`, self-contained, with STOP conditions, in/out-of-scope file lists, and a git-SHA drift check. Finish with `plans/README.md` (priority order, dependencies, status, rejected findings).

---

## Examples

```
/audit
/audit quick
/audit security
/audit branch
/audit next
/audit plan add rate limiting to the auth endpoints
/audit reconcile
/audit security --issues
```

`reconcile` processes what happened since the last run (verifies DONE, investigates BLOCKED, refreshes drifted TODO, retires fixed-independently findings) — no code execution involved, just re-reading the backlog against current reality.

`--issues` publishes selected plans as GitHub issues, gated on an explicit flag and a public-repo visibility warning before publishing anything sensitive. Requires `gh auth status` to succeed.

---

## Key Principles

- **Survey, don't fix** — the plan is the product, this command never edits source code.
- **Reuse, don't re-derive** — each audit category routes to the DevBureau skill that already owns that knowledge.
- **Vet before presenting** — a finding that wasn't re-read by you, not just a subagent, doesn't reach the user.
- **Self-contained plans** — written for a different agent or session with no memory of this one.
